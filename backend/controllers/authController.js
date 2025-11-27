import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { jwtConfig } from '../config/jwt.js';
import { users, shops, loginHistory } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { sanitizeUser } from '../utils/helpers.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
      message: 'Login successful',
      user: sanitizeUser(user),
      token: accessToken,
      shop,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role, shopId, businessName, phone, whatsapp, address } = req.validatedBody;

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const [existingUsername] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
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
      message: 'Registration successful',
      user: sanitizeUser(newUser),
      token: accessToken
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await db.update(users).set({ refreshToken: null }).where(eq(users.id, req.user.id));
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    const [user] = await db.select().from(users).where(
      and(eq(users.id, decoded.userId), eq(users.refreshToken, token))
    ).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role, shopId: user.shopId },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    res.json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
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
    res.status(500).json({ error: 'Failed to get user info' });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.validatedBody;

    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, req.user.id));

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};

export default { login, register, logout, refreshToken, getMe, updatePassword };
