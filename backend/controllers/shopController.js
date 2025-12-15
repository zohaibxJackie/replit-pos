import { db } from '../config/database.js';
import { shops, users, userShop, pricingPlans, stock } from '../../shared/schema.js';
import { eq, desc, ilike, sql, and, or, inArray } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

const getMaxShopsFromPlan = async (userId) => {
  const ownedShops = await db.select().from(shops).where(eq(shops.ownerId, userId));
  
  if (ownedShops.length === 0) {
    const [defaultPlan] = await db.select().from(pricingPlans)
      .where(eq(pricingPlans.name, 'Silver'))
      .limit(1);
    return defaultPlan?.maxShops || 1;
  }
  
  const primaryShop = ownedShops[0];
  const tierName = primaryShop.subscriptionTier.charAt(0).toUpperCase() + primaryShop.subscriptionTier.slice(1);
  
  const [plan] = await db.select().from(pricingPlans)
    .where(eq(pricingPlans.name, tierName))
    .limit(1);
  
  return plan?.maxShops || 1;
};

const getAdminShopCount = async (userId) => {
  const myUserShops = await db.select({ shopId: userShop.shopId })
    .from(userShop)
    .where(eq(userShop.userId, userId));
  
  const ownedShops = await db.select({ id: shops.id }).from(shops).where(eq(shops.ownerId, userId));
  
  const uniqueShopIds = new Set([
    ...myUserShops.map(us => us.shopId),
    ...ownedShops.map(s => s.id)
  ]);
  
  return uniqueShopIds.size;
};

export const getShops = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(shops.name, `%${search}%`),
          ilike(shops.address, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(shops.subscriptionStatus, status));
    }

    let query = db.select().from(shops);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const shopList = await query
      .orderBy(desc(shops.createdAt))
      .limit(pageLimit)
      .offset(offset);

    let countQuery = db.select({ count: sql`count(*)::int` }).from(shops);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const [{ count }] = await countQuery;

    res.json({
      shops: shopList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ error: req.t('shop.fetch_failed') });
  }
};

export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;

    const [shop] = await db.select().from(shops).where(eq(shops.id, id)).limit(1);

    if (!shop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    // Count stock items for this shop
    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(stock)
      .where(and(eq(stock.shopId, id), eq(stock.isActive, true)));

    const [{ staffCount }] = await db.select({ staffCount: sql`count(*)::int` })
      .from(userShop)
      .where(eq(userShop.shopId, id));

    res.json({
      shop,
      stats: {
        productCount,
        staffCount
      }
    });
  } catch (error) {
    console.error('Get shop by id error:', error);
    res.status(500).json({ error: req.t('shop.fetch_one_failed') });
  }
};

export const createShop = async (req, res) => {
  try {
    const { name, phone, whatsapp, address, subscriptionTier } = req.validatedBody;
    const userId = req.user.id;

    const maxShops = await getMaxShopsFromPlan(userId);
    const currentShops = await getAdminShopCount(userId);

    if (currentShops >= maxShops) {
      return res.status(400).json({ 
        error: req.t('shop.max_shops_reached'),
        maxShops,
        currentShops
      });
    }

    const [newShop] = await db.insert(shops).values({
      name,
      ownerId: userId,
      phone,
      whatsapp,
      address,
      subscriptionTier: subscriptionTier || 'silver'
    }).returning();

    await db.insert(userShop).values({
      userId,
      shopId: newShop.id
    });

    res.status(201).json({ shop: newShop });
  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({ error: req.t('shop.create_failed') });
  }
};

export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, whatsapp, address, subscriptionTier, subscriptionStatus } = req.body;

    const [existingShop] = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
    if (!existingShop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    if (req.user.role !== 'super_admin' && existingShop.ownerId !== req.user.id) {
      return res.status(403).json({ error: req.t('shop.access_denied') });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (address !== undefined) updateData.address = address;
    if (subscriptionTier && req.user.role === 'super_admin') updateData.subscriptionTier = subscriptionTier;
    if (subscriptionStatus && req.user.role === 'super_admin') updateData.subscriptionStatus = subscriptionStatus;

    const [updatedShop] = await db.update(shops)
      .set(updateData)
      .where(eq(shops.id, id))
      .returning();

    res.json({ shop: updatedShop });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({ error: req.t('shop.update_failed') });
  }
};

export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingShop] = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
    if (!existingShop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    await db.update(shops)
      .set({ subscriptionStatus: 'inactive' })
      .where(eq(shops.id, id));

    res.json({ message: req.t('shop.deactivated') });
  } catch (error) {
    console.error('Delete shop error:', error);
    res.status(500).json({ error: req.t('shop.delete_failed') });
  }
};

export const getMyShops = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const myUserShops = await db.select({ shopId: userShop.shopId })
      .from(userShop)
      .where(eq(userShop.userId, userId));
    
    const shopIds = myUserShops.map(us => us.shopId);
    
    const ownedShops = await db.select().from(shops).where(eq(shops.ownerId, userId));
    
    let allShops = [...ownedShops];
    
    if (shopIds.length > 0) {
      const linkedShops = await db.select().from(shops).where(inArray(shops.id, shopIds));
      const existingIds = new Set(allShops.map(s => s.id));
      linkedShops.forEach(shop => {
        if (!existingIds.has(shop.id)) {
          allShops.push(shop);
        }
      });
    }
    
    const maxShops = await getMaxShopsFromPlan(userId);
    
    res.json({
      shops: allShops,
      maxShops,
      canAddMore: allShops.length < maxShops
    });
  } catch (error) {
    console.error('Get my shops error:', error);
    res.status(500).json({ error: req.t('shop.fetch_failed') });
  }
};

export const createAdminShop = async (req, res) => {
  try {
    const { name, phone, whatsapp, address, currencyCode } = req.body;
    const userId = req.user.id;
    
    const maxShops = await getMaxShopsFromPlan(userId);
    const currentShops = await getAdminShopCount(userId);
    
    if (currentShops >= maxShops) {
      return res.status(400).json({ 
        error: req.t('shop.max_shops_reached'),
        maxShops,
        currentShops
      });
    }
    
    const ownedShops = await db.select().from(shops).where(eq(shops.ownerId, userId));
    const subscriptionTier = ownedShops.length > 0 ? ownedShops[0].subscriptionTier : 'silver';
    
    const [newShop] = await db.insert(shops).values({
      name,
      ownerId: userId,
      phone,
      whatsapp,
      address,
      subscriptionTier,
      currencyCode: currencyCode || 'USD'
    }).returning();
    
    await db.insert(userShop).values({
      userId,
      shopId: newShop.id
    });

    res.status(201).json({ shop: newShop });
  } catch (error) {
    console.error('Create admin shop error:', error);
    res.status(500).json({ error: req.t('shop.create_failed') });
  }
};

export const updateAdminShop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, whatsapp, address, currencyCode } = req.body;
    const userId = req.user.id;

    const [existingShop] = await db.select().from(shops).where(eq(shops.id, id)).limit(1);
    if (!existingShop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    const hasAccess = existingShop.ownerId === userId || 
      (await db.select().from(userShop).where(and(eq(userShop.userId, userId), eq(userShop.shopId, id))).limit(1)).length > 0;
    
    if (!hasAccess && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: req.t('shop.access_denied') });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (address !== undefined) updateData.address = address;
    if (currencyCode !== undefined) updateData.currencyCode = currencyCode;

    const [updatedShop] = await db.update(shops)
      .set(updateData)
      .where(eq(shops.id, id))
      .returning();

    res.json({ shop: updatedShop });
  } catch (error) {
    console.error('Update admin shop error:', error);
    res.status(500).json({ error: req.t('shop.update_failed') });
  }
};

export default { getShops, getShopById, createShop, updateShop, deleteShop, getMyShops, createAdminShop, updateAdminShop };
