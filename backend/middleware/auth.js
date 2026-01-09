import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.js";
import { db } from "../config/database.js";
import { users, userShop } from "../../shared/schema.js";
import { eq, inArray } from "drizzle-orm";

export const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        error: req.t
          ? req.t("middleware.access_token_required")
          : "Access token required",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Fetch user from DB
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        error: req.t ? req.t("middleware.user_not_found") : "User not found",
      });
    }

    // Fetch shops linked to the user
    const userShops = await db
      .select({ shopId: userShop.shopId })
      .from(userShop)
      .where(eq(userShop.userId, user.id));

    // Assign values to request — no overwriting!
    req.user = user; // DB user
    req.decoded = decoded; // JWT decoded
    req.userShopIds = userShops.map((us) => us.shopId); // shops from DB

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: req.t ? req.t("middleware.token_expired") : "Token expired",
      });
    }
    return res.status(403).json({
      error: req.t ? req.t("middleware.invalid_token") : "Invalid token",
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({
          error: req.t
            ? req.t("middleware.authentication_required")
            : "Authentication required",
        });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({
          error: req.t
            ? req.t("middleware.insufficient_permissions")
            : "Insufficient permissions",
        });
    }

    next();
  };
};

export const requireShopAccess = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({
        error: req.t
          ? req.t("middleware.authentication_required")
          : "Authentication required",
      });
  }

  const shopId = req.params.shopId || req.body.shopId || req.query.shopId;

  if (req.user.role === "super_admin") {
    return next();
  }

  if (shopId && !req.userShopIds?.includes(shopId)) {
    return res
      .status(403)
      .json({
        error: req.t
          ? req.t("middleware.access_denied_shop")
          : "Access denied to this shop",
      });
  }

  next();
};

export default { authenticateToken, requireRole, requireShopAccess };
