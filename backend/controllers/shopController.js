import { db } from '../config/database.js';
import { shops, users, products } from '../../shared/schema.js';
import { eq, desc, ilike, sql, and, or } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

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

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(products)
      .where(eq(products.shopId, id));

    const [{ staffCount }] = await db.select({ staffCount: sql`count(*)::int` })
      .from(users)
      .where(eq(users.shopId, id));

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

    const [newShop] = await db.insert(shops).values({
      name,
      ownerId: req.user.id,
      phone,
      whatsapp,
      address,
      subscriptionTier: subscriptionTier || 'silver'
    }).returning();

    if (!req.user.shopId) {
      await db.update(users).set({ shopId: newShop.id }).where(eq(users.id, req.user.id));
    }

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

export default { getShops, getShopById, createShop, updateShop, deleteShop };
