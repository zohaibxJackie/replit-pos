import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { db } from '../config/database.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);
    const [user] = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireShopAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const shopId = req.params.shopId || req.body.shopId || req.query.shopId;

  if (req.user.role === 'super_admin') {
    return next();
  }

  if (shopId && req.user.shopId !== shopId) {
    return res.status(403).json({ error: 'Access denied to this shop' });
  }

  next();
};

export default { authenticateToken, requireRole, requireShopAccess };
