import { db } from '../config/database.js';
import { garbage, stock, reason, variant, product, brand, shops } from '../../shared/schema.js';
import { eq, sql, and, desc, inArray } from 'drizzle-orm';
import { createGarbageSchema, updateGarbageSchema } from '../validators/inventory.js';
import { paginationHelper } from '../utils/helpers.js';
import { logActivity } from './notificationController.js';

export const getGarbage = async (req, res) => {
  try {
    const { page = 1, limit = 20, shopId: queryShopId, reasonId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const userShopIds = req.userShopIds || [];

    if (userShopIds.length === 0) {
      return res.status(400).json({ error: req.t('garbage.shop_required') });
    }
    
    let conditions = [];

    if (queryShopId && userShopIds.includes(queryShopId)) {
      conditions.push(eq(stock.shopId, queryShopId));
    } else {
      conditions.push(inArray(stock.shopId, userShopIds));
    }
    
    if (reasonId) {
      conditions.push(eq(garbage.reasonId, reasonId));
    }

    conditions.push(eq(garbage.isActive, true));

    const whereClause = and(...conditions);

    const garbageList = await db.select({
      id: garbage.id,
      stockId: garbage.stockId,
      reasonId: garbage.reasonId,
      isActive: garbage.isActive,
      createdAt: garbage.createdAt,
      updatedAt: garbage.updatedAt,
      reasonText: reason.text,
      primaryImei: stock.primaryImei,
      secondaryImei: stock.secondaryImei,
      serialNumber: stock.serialNumber,
      barcode: stock.barcode,
      condition: stock.condition,
      shopId: stock.shopId,
      variantName: variant.variantName,
      productName: product.name,
      brandName: brand.name,
      shopName: shops.name
    })
      .from(garbage)
      .leftJoin(stock, eq(garbage.stockId, stock.id))
      .leftJoin(reason, eq(garbage.reasonId, reason.id))
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(shops, eq(stock.shopId, shops.id))
      .where(whereClause)
      .orderBy(desc(garbage.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(garbage)
      .leftJoin(stock, eq(garbage.stockId, stock.id))
      .where(whereClause);

    res.json({
      garbage: garbageList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get garbage error:', error);
    res.status(500).json({ error: req.t('garbage.fetch_failed') });
  }
};

export const getGarbageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userShopIds = req.userShopIds || [];

    const [garbageItem] = await db.select({
      id: garbage.id,
      stockId: garbage.stockId,
      reasonId: garbage.reasonId,
      isActive: garbage.isActive,
      createdAt: garbage.createdAt,
      updatedAt: garbage.updatedAt,
      reasonText: reason.text,
      primaryImei: stock.primaryImei,
      secondaryImei: stock.secondaryImei,
      serialNumber: stock.serialNumber,
      barcode: stock.barcode,
      condition: stock.condition,
      purchasePrice: stock.purchasePrice,
      salePrice: stock.salePrice,
      shopId: stock.shopId,
      variantName: variant.variantName,
      productName: product.name,
      brandName: brand.name,
      shopName: shops.name
    })
      .from(garbage)
      .leftJoin(stock, eq(garbage.stockId, stock.id))
      .leftJoin(reason, eq(garbage.reasonId, reason.id))
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(shops, eq(stock.shopId, shops.id))
      .where(and(eq(garbage.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!garbageItem) {
      return res.status(404).json({ error: req.t('garbage.not_found') });
    }

    res.json({ garbage: garbageItem });
  } catch (error) {
    console.error('Get garbage by id error:', error);
    res.status(500).json({ error: req.t('garbage.fetch_failed') });
  }
};

export const createGarbage = async (req, res) => {
  try {
    const validation = createGarbageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { stockId, reasonId } = validation.data;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db.select().from(stock).where(
      and(eq(stock.id, stockId), inArray(stock.shopId, userShopIds))
    ).limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t('stock.not_found') });
    }

    if (stockItem.isSold || stockItem.stockStatus === 'sold') {
      return res.status(400).json({ error: req.t('garbage.stock_already_sold') });
    }

    const [existingGarbage] = await db.select().from(garbage).where(
      eq(garbage.stockId, stockId)
    ).limit(1);

    if (existingGarbage) {
      return res.status(409).json({ error: req.t('garbage.already_exists') });
    }

    const [reasonItem] = await db.select().from(reason).where(eq(reason.id, reasonId)).limit(1);
    if (!reasonItem) {
      return res.status(400).json({ error: req.t('reason.not_found') });
    }

    const [newGarbage] = await db.insert(garbage).values({
      stockId,
      reasonId
    }).returning();

    await db.update(stock)
      .set({ 
        stockStatus: 'defective',
        updatedAt: new Date()
      })
      .where(eq(stock.id, stockId));

    try {
      await logActivity(req.user?.id, 'create', 'garbage', newGarbage.id, {
        stockId,
        reasonId,
        primaryImei: stockItem.primaryImei,
        reasonText: reasonItem.text
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(201).json({ garbage: newGarbage });
  } catch (error) {
    console.error('Create garbage error:', error);
    res.status(500).json({ error: req.t('garbage.create_failed') });
  }
};

export const updateGarbage = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = updateGarbageSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const userShopIds = req.userShopIds || [];

    const [existingGarbage] = await db.select({
      id: garbage.id,
      stockId: garbage.stockId,
      reasonId: garbage.reasonId,
      shopId: stock.shopId
    })
      .from(garbage)
      .leftJoin(stock, eq(garbage.stockId, stock.id))
      .where(and(eq(garbage.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!existingGarbage) {
      return res.status(404).json({ error: req.t('garbage.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    
    if (validation.data.reasonId !== undefined) {
      const [reasonItem] = await db.select().from(reason).where(eq(reason.id, validation.data.reasonId)).limit(1);
      if (!reasonItem) {
        return res.status(400).json({ error: req.t('reason.not_found') });
      }
      updateData.reasonId = validation.data.reasonId;
    }
    
    if (validation.data.isActive !== undefined) {
      updateData.isActive = validation.data.isActive;
    }

    const [updatedGarbage] = await db.update(garbage)
      .set(updateData)
      .where(eq(garbage.id, id))
      .returning();

    res.json({ garbage: updatedGarbage });
  } catch (error) {
    console.error('Update garbage error:', error);
    res.status(500).json({ error: req.t('garbage.update_failed') });
  }
};

export const deleteGarbage = async (req, res) => {
  try {
    const { id } = req.params;
    const userShopIds = req.userShopIds || [];

    const [existingGarbage] = await db.select({
      id: garbage.id,
      stockId: garbage.stockId,
      shopId: stock.shopId
    })
      .from(garbage)
      .leftJoin(stock, eq(garbage.stockId, stock.id))
      .where(and(eq(garbage.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!existingGarbage) {
      return res.status(404).json({ error: req.t('garbage.not_found') });
    }

    await db.delete(garbage).where(eq(garbage.id, id));

    await db.update(stock)
      .set({ 
        stockStatus: 'in_stock',
        updatedAt: new Date()
      })
      .where(eq(stock.id, existingGarbage.stockId));

    try {
      await logActivity(req.user?.id, 'delete', 'garbage', id, {
        stockId: existingGarbage.stockId
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.json({ message: req.t('garbage.deleted') });
  } catch (error) {
    console.error('Delete garbage error:', error);
    res.status(500).json({ error: req.t('garbage.delete_failed') });
  }
};

export default { 
  getGarbage, 
  getGarbageById, 
  createGarbage, 
  updateGarbage, 
  deleteGarbage 
};
