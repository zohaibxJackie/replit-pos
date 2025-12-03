import { db } from '../config/database.js';
import { stockTransfers, products, shops } from '../../shared/schema.js';
import { eq, and, desc, or, inArray } from 'drizzle-orm';

export const getStockTransfers = async (req, res) => {
  try {
    const userShopIds = req.userShopIds || [];

    const transfers = await db.select()
      .from(stockTransfers)
      .where(
        or(
          inArray(stockTransfers.fromShopId, userShopIds),
          inArray(stockTransfers.toShopId, userShopIds)
        )
      )
      .orderBy(desc(stockTransfers.createdAt));

    res.json({ transfers });
  } catch (error) {
    console.error('Get stock transfers error:', error);
    res.status(500).json({ error: req.t('stock_transfer.fetch_failed') });
  }
};

export const createStockTransfer = async (req, res) => {
  try {
    const { productId, fromShopId, toShopId, quantity, notes } = req.body;
    const userId = req.user.id;
    const userShopIds = req.userShopIds || [];

    if (!productId || !fromShopId || !toShopId) {
      return res.status(400).json({ error: req.t('stock_transfer.missing_fields') });
    }

    if (fromShopId === toShopId) {
      return res.status(400).json({ error: req.t('stock_transfer.same_shop') });
    }

    if (!userShopIds.includes(fromShopId)) {
      return res.status(403).json({ error: req.t('stock_transfer.unauthorized_from_shop') });
    }

    if (!userShopIds.includes(toShopId)) {
      return res.status(403).json({ error: req.t('stock_transfer.unauthorized_to_shop') });
    }

    const [product] = await db.select().from(products).where(
      and(eq(products.id, productId), eq(products.shopId, fromShopId))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('stock_transfer.product_not_found') });
    }

    const transferQty = quantity || 1;

    if (product.stock < transferQty) {
      return res.status(400).json({ error: req.t('stock_transfer.insufficient_stock') });
    }

    const [toShop] = await db.select().from(shops).where(eq(shops.id, toShopId)).limit(1);
    if (!toShop) {
      return res.status(404).json({ error: req.t('stock_transfer.target_shop_not_found') });
    }

    await db.update(products)
      .set({ 
        stock: product.stock - transferQty,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));

    const [newTransfer] = await db.insert(stockTransfers).values({
      productId,
      fromShopId,
      toShopId,
      quantity: transferQty,
      status: 'completed',
      notes: notes || null,
      createdBy: userId
    }).returning();

    res.status(201).json({ transfer: newTransfer });
  } catch (error) {
    console.error('Create stock transfer error:', error);
    res.status(500).json({ error: req.t('stock_transfer.create_failed') });
  }
};

export const getProductByImeiForTransfer = async (req, res) => {
  try {
    const { imei } = req.params;
    const userShopIds = req.userShopIds || [];

    const [product] = await db.select().from(products).where(
      and(
        or(eq(products.imei1, imei), eq(products.imei2, imei)),
        inArray(products.shopId, userShopIds)
      )
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by IMEI for transfer error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export default {
  getStockTransfers,
  createStockTransfer,
  getProductByImeiForTransfer
};
