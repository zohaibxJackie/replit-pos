import { db } from '../config/database.js';
import { reason, garbage, users } from '../../shared/schema.js';
import { eq, sql, ilike, and, desc } from 'drizzle-orm';
import { createReasonSchema, updateReasonSchema } from '../validators/inventory.js';
import { paginationHelper } from '../utils/helpers.js';

export const getReasons = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive, userId: queryUserId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    
    let conditions = [];
    
    if (search) {
      conditions.push(ilike(reason.text, `%${search}%`));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(reason.isActive, isActive === 'true'));
    }

    if (queryUserId) {
      conditions.push(eq(reason.userId, queryUserId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const reasonList = await db.select({
      id: reason.id,
      text: reason.text,
      userId: reason.userId,
      isActive: reason.isActive,
      createdAt: reason.createdAt,
      updatedAt: reason.updatedAt,
      username: users.username
    })
      .from(reason)
      .leftJoin(users, eq(reason.userId, users.id))
      .where(whereClause)
      .orderBy(desc(reason.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(reason)
      .where(whereClause);

    res.json({
      reasons: reasonList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get reasons error:', error);
    res.status(500).json({ error: req.t('reason.fetch_failed') });
  }
};

export const getReasonById = async (req, res) => {
  try {
    const { id } = req.params;

    const [reasonItem] = await db.select({
      id: reason.id,
      text: reason.text,
      userId: reason.userId,
      isActive: reason.isActive,
      createdAt: reason.createdAt,
      updatedAt: reason.updatedAt,
      username: users.username
    })
      .from(reason)
      .leftJoin(users, eq(reason.userId, users.id))
      .where(eq(reason.id, id))
      .limit(1);

    if (!reasonItem) {
      return res.status(404).json({ error: req.t('reason.not_found') });
    }

    const [{ garbageCount }] = await db.select({ garbageCount: sql`count(*)::int` })
      .from(garbage)
      .where(eq(garbage.reasonId, id));

    res.json({
      reason: reasonItem,
      garbageCount
    });
  } catch (error) {
    console.error('Get reason by id error:', error);
    res.status(500).json({ error: req.t('reason.fetch_failed') });
  }
};

export const getActiveReasons = async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;
    
    let conditions = [eq(reason.isActive, true)];
    
    if (search) {
      conditions.push(ilike(reason.text, `%${search}%`));
    }

    const reasonList = await db.select({
      id: reason.id,
      text: reason.text,
      userId: reason.userId
    })
      .from(reason)
      .where(and(...conditions))
      .orderBy(reason.text)
      .limit(parseInt(limit));

    res.json({ reasons: reasonList });
  } catch (error) {
    console.error('Get active reasons error:', error);
    res.status(500).json({ error: req.t('reason.fetch_failed') });
  }
};

export const createReason = async (req, res) => {
  try {
    const validation = createReasonSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { text, isActive } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: req.t('auth.unauthorized') });
    }

    const [newReason] = await db.insert(reason).values({
      text,
      userId,
      isActive: isActive ?? true
    }).returning();

    res.status(201).json({ reason: newReason });
  } catch (error) {
    console.error('Create reason error:', error);
    res.status(500).json({ error: req.t('reason.create_failed') });
  }
};

export const updateReason = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = updateReasonSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const [existingReason] = await db.select().from(reason).where(
      eq(reason.id, id)
    ).limit(1);

    if (!existingReason) {
      return res.status(404).json({ error: req.t('reason.not_found') });
    }

    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && existingReason.userId !== req.user?.id) {
      return res.status(403).json({ error: req.t('reason.access_denied') });
    }

    const updateData = { updatedAt: new Date() };
    
    if (validation.data.text !== undefined) {
      updateData.text = validation.data.text;
    }
    if (validation.data.isActive !== undefined) {
      updateData.isActive = validation.data.isActive;
    }

    const [updatedReason] = await db.update(reason)
      .set(updateData)
      .where(eq(reason.id, id))
      .returning();

    res.json({ reason: updatedReason });
  } catch (error) {
    console.error('Update reason error:', error);
    res.status(500).json({ error: req.t('reason.update_failed') });
  }
};

export const deleteReason = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingReason] = await db.select().from(reason).where(
      eq(reason.id, id)
    ).limit(1);

    if (!existingReason) {
      return res.status(404).json({ error: req.t('reason.not_found') });
    }

    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && existingReason.userId !== req.user?.id) {
      return res.status(403).json({ error: req.t('reason.access_denied') });
    }

    const [{ garbageCount }] = await db.select({ garbageCount: sql`count(*)::int` })
      .from(garbage)
      .where(eq(garbage.reasonId, id));

    if (garbageCount > 0) {
      return res.status(400).json({ error: req.t('reason.has_garbage') });
    }

    await db.delete(reason).where(eq(reason.id, id));

    res.json({ message: req.t('reason.deleted') });
  } catch (error) {
    console.error('Delete reason error:', error);
    res.status(500).json({ error: req.t('reason.delete_failed') });
  }
};

export default { 
  getReasons, 
  getReasonById, 
  getActiveReasons,
  createReason, 
  updateReason, 
  deleteReason 
};
