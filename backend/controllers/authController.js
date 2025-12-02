import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { jwtConfig } from '../config/jwt.js';
import { users, shops, loginHistory, passwordResetRequests } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { sanitizeUser } from '../utils/helpers.js';
import { createNotification } from './notificationController.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: req.t('auth.invalid_credentials') });
    }

    if (!user.active) {
      return res.status(401).json({ error: req.t('auth.account_inactive') });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: req.t('auth.invalid_credentials') });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, shopId: user.shopId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      jwtConfig.secret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );

    await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));

    await db.insert(loginHistory).values({
      userId: user.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      deviceInfo: req.headers['user-agent']
    });

    let shop = null;
    if (user.shopId) {
      const [shopData] = await db.select().from(shops).where(eq(shops.id, user.shopId)).limit(1);
      shop = shopData;
    }

    res.json({
      success: true,
      message: req.t('auth.login_successful'),
      user: sanitizeUser(user),
      token: accessToken,
      shop,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: req.t('auth.login_failed') });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role, businessName, phone, whatsapp, address } = req.validatedBody;

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return res.status(409).json({ error: req.t('auth.email_already_registered') });
    }

    const [existingUsername] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername) {
      return res.status(409).json({ error: req.t('auth.username_already_taken') });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role: role || 'admin',
      shopId,
      businessName,
      phone,
      whatsapp,
      address
    }).returning();

    if (role === 'admin' && !shopId) {
      const [newShop] = await db.insert(shops).values({
        name: businessName || `${username}'s Shop`,
        ownerId: newUser.id,
        phone,
        whatsapp,
        address
      }).returning();

      await db.update(users).set({ shopId: newShop.id }).where(eq(users.id, newUser.id));
      newUser.shopId = newShop.id;
    }

    const accessToken = jwt.sign(
      { userId: newUser.id, role: newUser.role, shopId: newUser.shopId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.status(201).json({
      success: true,
      message: req.t('auth.registration_successful'),
      user: sanitizeUser(newUser),
      token: accessToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: req.t('auth.registration_failed') });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await db.update(users).set({ refreshToken: null }).where(eq(users.id, req.user.id));
    }
    res.json({ success: true, message: req.t('auth.logout_successful') });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: req.t('auth.logout_failed') });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: req.t('auth.refresh_token_required') });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    const [user] = await db.select().from(users).where(
      and(eq(users.id, decoded.userId), eq(users.refreshToken, token))
    ).limit(1);

    if (!user) {
      return res.status(401).json({ error: req.t('auth.invalid_refresh_token') });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, shopId: user.shopId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: req.t('auth.invalid_refresh_token') });
  }
};

export const getMe = async (req, res) => {
  try {
    let shop = null;
    if (req.user.shopId) {
      const [shopData] = await db.select().from(shops).where(eq(shops.id, req.user.shopId)).limit(1);
      shop = shopData;
    }

    res.json({
      user: sanitizeUser(req.user),
      shop
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: req.t('auth.failed_get_user_info') });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;

    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: req.t('auth.current_password_incorrect') });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, req.user.id));

    res.json({ message: req.t('auth.password_updated') });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: req.t('auth.password_update_failed') });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: req.t('auth.email_required') });
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.json({ 
        message: req.t('auth.password_reset_email_sent')
      });
    }

    if (user.role === 'sales_person') {
      const [shop] = await db.select().from(shops).where(eq(shops.id, user.shopId)).limit(1);
      
      if (shop) {
        const [existingRequest] = await db.select().from(passwordResetRequests)
          .where(and(
            eq(passwordResetRequests.userId, user.id),
            eq(passwordResetRequests.status, 'pending')
          ))
          .limit(1);

        if (!existingRequest) {
          await db.insert(passwordResetRequests).values({
            userId: user.id,
            adminId: shop.ownerId,
            requestMessage: 'Password reset requested via forgot password',
            status: 'pending'
          });

          await createNotification(
            shop.ownerId,
            'Password Reset Request',
            `${user.username} has requested a password reset. Please review and update their password.`,
            'warning',
            `/admin/sale-managers`
          );
        }
      }

      return res.json({ 
        message: req.t('auth.password_reset_request_sent_admin'),
        type: 'admin_notification'
      });
    }

    return res.json({ 
      message: req.t('auth.password_reset_email_sent'),
      type: 'email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: req.t('auth.password_reset_failed') });
  }
};

export default { login, register, logout, refreshToken, getMe, updatePassword, forgotPassword };
