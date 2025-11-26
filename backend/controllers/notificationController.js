import { db } from '../config/database.js';
import { notifications, activityLogs } from '../../shared/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [eq(notifications.userId, req.user.id)];

    if (unreadOnly === 'true') {
      conditions.push(eq(notifications.isRead, false));
    }

    const whereClause = and(...conditions);

    const notificationList = await db.select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(notifications)
      .where(whereClause);

    const [{ unreadCount }] = await db.select({ unreadCount: sql`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, req.user.id), eq(notifications.isRead, false)));

    res.json({
      notifications: notificationList,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [notification] = await db.select().from(notifications).where(
      and(eq(notifications.id, id), eq(notifications.userId, req.user.id))
    ).limit(1);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const [updated] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();

    res.json({ notification: updated });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, req.user.id), eq(notifications.isRead, false)));

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [notification] = await db.select().from(notifications).where(
      and(eq(notifications.id, id), eq(notifications.userId, req.user.id))
    ).limit(1);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await db.delete(notifications).where(eq(notifications.id, id));

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const createNotification = async (userId, title, message, type = 'info', actionUrl = null) => {
  try {
    const [notification] = await db.insert(notifications).values({
      userId,
      title,
      message,
      type,
      actionUrl
    }).returning();

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, entityType, action, userId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (req.user.role !== 'super_admin') {
      conditions.push(eq(activityLogs.userId, req.user.id));
    } else if (userId) {
      conditions.push(eq(activityLogs.userId, userId));
    }

    if (entityType) {
      conditions.push(eq(activityLogs.entityType, entityType));
    }

    if (action) {
      conditions.push(eq(activityLogs.action, action));
    }

    let query = db.select().from(activityLogs);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const logs = await query
      .orderBy(desc(activityLogs.createdAt))
      .limit(pageLimit)
      .offset(offset);

    let countQuery = db.select({ count: sql`count(*)::int` }).from(activityLogs);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    res.json({
      activityLogs: logs,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
};

export const logActivity = async (userId, action, entityType, entityId = null, details = null, req = null) => {
  try {
    const [log] = await db.insert(activityLogs).values({
      userId,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null
    }).returning();

    return log;
  } catch (error) {
    console.error('Log activity error:', error);
    return null;
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getActivityLogs,
  logActivity
};
