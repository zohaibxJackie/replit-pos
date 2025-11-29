import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users, shops, pricingPlans, passwordResetRequests, notifications } from '../../shared/schema.js';
import { eq, and, or, ilike, desc, sql, ne } from 'drizzle-orm';
import { sanitizeUser, paginationHelper } from '../utils/helpers.js';
import { createNotification } from './notificationController.js';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, shopId, search } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (req.user.role !== 'super_admin') {
      conditions.push(eq(users.shopId, req.user.shopId));
    } else if (shopId) {
      conditions.push(eq(users.shopId, shopId));
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    if (search) {
      conditions.push(
        or(
          ilike(users.username, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }

    let query = db.select().from(users);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const userList = await query
      .orderBy(desc(users.createdAt))
      .limit(pageLimit)
      .offset(offset);

    let countQuery = db.select({ count: sql`count(*)::int` }).from(users);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    res.json({
      users: userList.map(sanitizeUser),
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role !== 'super_admin' && user.shopId !== req.user.shopId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const getStaffLimits = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    
    const [shop] = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const [plan] = await db.select().from(pricingPlans)
      .where(eq(pricingPlans.name, shop.subscriptionTier.charAt(0).toUpperCase() + shop.subscriptionTier.slice(1)))
      .limit(1);

    const [{ count: currentStaffCount }] = await db.select({ count: sql`count(*)::int` })
      .from(users)
      .where(and(
        eq(users.shopId, shopId),
        eq(users.role, 'sales_person'),
        eq(users.active, true)
      ));

    const maxStaff = plan?.maxStaff || 3;
    const remainingSlots = Math.max(0, maxStaff - currentStaffCount);

    res.json({
      currentStaff: currentStaffCount,
      maxStaff,
      remainingSlots,
      plan: shop.subscriptionTier,
      canAddMore: remainingSlots > 0
    });
  } catch (error) {
    console.error('Get staff limits error:', error);
    res.status(500).json({ error: 'Failed to fetch staff limits' });
  }
};

export const createSalesPerson = async (req, res) => {
  try {
    const { username, email, password, phone, whatsapp, address } = req.body;
    const shopId = req.user.shopId;

    const [shop] = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const [plan] = await db.select().from(pricingPlans)
      .where(eq(pricingPlans.name, shop.subscriptionTier.charAt(0).toUpperCase() + shop.subscriptionTier.slice(1)))
      .limit(1);

    const [{ count: currentStaffCount }] = await db.select({ count: sql`count(*)::int` })
      .from(users)
      .where(and(
        eq(users.shopId, shopId),
        eq(users.role, 'sales_person'),
        eq(users.active, true)
      ));

    const maxStaff = plan?.maxStaff || 3;
    if (currentStaffCount >= maxStaff) {
      return res.status(403).json({ 
        error: `Staff limit reached. Your ${shop.subscriptionTier} plan allows maximum ${maxStaff} sales persons. Please upgrade your plan.`,
        currentCount: currentStaffCount,
        maxAllowed: maxStaff
      });
    }

    const [existingEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingEmail) {
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
      role: 'sales_person',
      shopId,
      phone,
      whatsapp,
      address
    }).returning();

    res.status(201).json({ 
      user: sanitizeUser(newUser),
      message: 'Sales person created successfully',
      staffCount: currentStaffCount + 1,
      maxStaff
    });
  } catch (error) {
    console.error('Create sales person error:', error);
    res.status(500).json({ error: 'Failed to create sales person' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, shopId, businessName, phone, whatsapp, address } = req.body;

    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const assignedShopId = req.user.role === 'super_admin' ? shopId : req.user.shopId;

    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      role,
      shopId: assignedShopId,
      businessName,
      phone,
      whatsapp,
      address
    }).returning();

    res.status(201).json({ user: sanitizeUser(newUser) });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, businessName, phone, whatsapp, address, active } = req.body;

    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role !== 'super_admin' && existingUser.shopId !== req.user.shopId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role && req.user.role === 'super_admin') updateData.role = role;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (address !== undefined) updateData.address = address;
    if (active !== undefined) updateData.active = active;
    updateData.modifiedAt = new Date();

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    res.json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role !== 'super_admin' && existingUser.shopId !== req.user.shopId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (existingUser.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete super admin' });
    }

    await db.update(users).set({ active: false }).where(eq(users.id, id));

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let shop = null;
    if (user.shopId) {
      const [shopData] = await db.select().from(shops).where(eq(shops.id, user.shopId)).limit(1);
      shop = shopData;
    }

    res.json({ user: sanitizeUser(user), shop });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const { username, email, businessName, phone, whatsapp, address } = req.body;

    if (email && email !== req.user.email) {
      const [existingEmail] = await db.select().from(users)
        .where(and(eq(users.email, email), ne(users.id, req.user.id)))
        .limit(1);
      if (existingEmail) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    if (username && username !== req.user.username) {
      const [existingUsername] = await db.select().from(users)
        .where(and(eq(users.username, username), ne(users.id, req.user.id)))
        .limit(1);
      if (existingUsername) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (address !== undefined) updateData.address = address;
    updateData.modifiedAt = new Date();

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, req.user.id))
      .returning();

    res.json({ user: sanitizeUser(updatedUser), message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (req.user.role !== 'sales_person') {
      return res.status(403).json({ error: 'Only sales persons can request password reset through admin' });
    }

    const [existingRequest] = await db.select().from(passwordResetRequests)
      .where(and(
        eq(passwordResetRequests.userId, userId),
        eq(passwordResetRequests.status, 'pending')
      ))
      .limit(1);

    if (existingRequest) {
      return res.status(409).json({ error: 'You already have a pending password reset request' });
    }

    const [shop] = await db.select().from(shops).where(eq(shops.id, req.user.shopId)).limit(1);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const [newRequest] = await db.insert(passwordResetRequests).values({
      userId,
      adminId: shop.ownerId,
      requestMessage: message || 'Password reset requested',
      status: 'pending'
    }).returning();

    await createNotification(
      shop.ownerId,
      'Password Reset Request',
      `${req.user.username} has requested a password reset. Please review and update their password.`,
      'warning',
      `/admin/sale-managers`
    );

    res.status(201).json({ 
      message: 'Password reset request sent to admin',
      requestId: newRequest.id 
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({ error: 'Failed to submit password reset request' });
  }
};

export const getPasswordResetRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [eq(passwordResetRequests.adminId, req.user.id)];
    
    if (status) {
      conditions.push(eq(passwordResetRequests.status, status));
    }

    const requests = await db.select({
      id: passwordResetRequests.id,
      userId: passwordResetRequests.userId,
      status: passwordResetRequests.status,
      requestMessage: passwordResetRequests.requestMessage,
      createdAt: passwordResetRequests.createdAt,
      username: users.username,
      email: users.email
    })
      .from(passwordResetRequests)
      .leftJoin(users, eq(passwordResetRequests.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(passwordResetRequests.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(passwordResetRequests)
      .where(and(...conditions));

    res.json({
      requests,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get password reset requests error:', error);
    res.status(500).json({ error: 'Failed to fetch password reset requests' });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, requestId } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.user.role !== 'super_admin' && targetUser.shopId !== req.user.shopId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'admin' && targetUser.role !== 'sales_person') {
      return res.status(403).json({ error: 'Admins can only reset passwords for sales persons' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.update(users)
      .set({ password: hashedPassword, modifiedAt: new Date() })
      .where(eq(users.id, id));

    if (requestId) {
      await db.update(passwordResetRequests)
        .set({ status: 'approved', updatedAt: new Date() })
        .where(eq(passwordResetRequests.id, requestId));
    }

    await createNotification(
      targetUser.id,
      'Password Reset',
      'Your password has been reset by an administrator. Please login with your new password.',
      'info',
      '/login'
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset user password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const rejectPasswordResetRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const [request] = await db.select().from(passwordResetRequests)
      .where(eq(passwordResetRequests.id, id))
      .limit(1);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.adminId !== req.user.id && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.update(passwordResetRequests)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(passwordResetRequests.id, id));

    await createNotification(
      request.userId,
      'Password Reset Request Rejected',
      'Your password reset request has been rejected by the administrator.',
      'error'
    );

    res.json({ message: 'Password reset request rejected' });
  } catch (error) {
    console.error('Reject password reset request error:', error);
    res.status(500).json({ error: 'Failed to reject request' });
  }
};

export default { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  getStaffLimits,
  createSalesPerson,
  getMyProfile,
  updateMyProfile,
  requestPasswordReset,
  getPasswordResetRequests,
  resetUserPassword,
  rejectPasswordResetRequest
};
