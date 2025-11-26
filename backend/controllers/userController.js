import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { users, shops } from '../../shared/schema.js';
import { eq, and, or, ilike, desc, sql } from 'drizzle-orm';
import { sanitizeUser, paginationHelper } from '../utils/helpers.js';

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

export default { getUsers, getUserById, createUser, updateUser, deleteUser };
