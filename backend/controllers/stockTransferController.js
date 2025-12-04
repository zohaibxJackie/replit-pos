import { db } from '../config/database.js';
import { stockTransfers, products, shops, phoneUnits } from '../../shared/schema.js';
import { eq, and, desc, or, inArray } from 'drizzle-orm';
import { logActivity } from './notificationController.js';

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
    const { phoneUnitId, productId, fromShopId, toShopId, quantity, notes } = req.body;
    const userId = req.user.id;
    const userShopIds = req.userShopIds || [];

    if (!fromShopId || !toShopId) {
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

    const [toShop] = await db.select().from(shops).where(eq(shops.id, toShopId)).limit(1);
    if (!toShop) {
      return res.status(404).json({ error: req.t('stock_transfer.target_shop_not_found') });
    }

    const [fromShop] = await db.select().from(shops).where(eq(shops.id, fromShopId)).limit(1);

    let destinationProductId = null;
    let transferredPhoneUnit = null;
    let transferredProduct = null;

    // For mobile phones, we transfer individual phone units by their ID
    if (phoneUnitId) {
      const [phoneUnit] = await db.select().from(phoneUnits).where(
        and(
          eq(phoneUnits.id, phoneUnitId),
          eq(phoneUnits.shopId, fromShopId),
          eq(phoneUnits.status, 'in_stock')
        )
      ).limit(1);

      if (!phoneUnit) {
        return res.status(404).json({ error: req.t('stock_transfer.phone_unit_not_found') || 'Phone unit not found or not available for transfer' });
      }

      // Get associated product for logging
      const [product] = await db.select().from(products).where(eq(products.id, phoneUnit.productId)).limit(1);
      transferredProduct = product;

      // Update phone unit to new shop and mark as transferred temporarily
      await db.update(phoneUnits)
        .set({ 
          shopId: toShopId,
          status: 'in_stock',
          updatedAt: new Date()
        })
        .where(eq(phoneUnits.id, phoneUnitId));

      transferredPhoneUnit = phoneUnit;
      destinationProductId = phoneUnit.productId;

      // Create transfer record
      const [newTransfer] = await db.insert(stockTransfers).values({
        phoneUnitId,
        productId: phoneUnit.productId,
        fromShopId,
        toShopId,
        quantity: 1,
        status: 'completed',
        notes: notes || null,
        createdBy: userId
      }).returning();

      try {
        await logActivity(userId, 'transfer', 'stock_transfer', newTransfer.id, {
          phoneUnitId,
          productId: phoneUnit.productId,
          productName: product?.customName,
          imeiPrimary: phoneUnit.imeiPrimary,
          imeiSecondary: phoneUnit.imeiSecondary,
          fromShopId,
          fromShopName: fromShop?.name,
          toShopId,
          toShopName: toShop?.name,
          quantity: 1
        }, req);
      } catch (logError) {
        console.error('Activity logging failed:', logError);
      }

      return res.status(201).json({ transfer: newTransfer, phoneUnit: transferredPhoneUnit });
    }

    // For accessories, we transfer by product ID and quantity
    if (!productId) {
      return res.status(400).json({ error: req.t('stock_transfer.missing_fields') || 'Either phoneUnitId or productId is required' });
    }

    const [product] = await db.select().from(products).where(
      and(eq(products.id, productId), eq(products.shopId, fromShopId))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('stock_transfer.product_not_found') });
    }

    // Only allow accessories to be transferred by quantity
    if (product.categoryId === 'mobile') {
      return res.status(400).json({ error: req.t('stock_transfer.mobile_use_phone_unit') || 'Use phoneUnitId to transfer mobile phones' });
    }

    const transferQty = quantity || 1;

    if (product.stock < transferQty) {
      return res.status(400).json({ error: req.t('stock_transfer.insufficient_stock') });
    }

    // Deduct from source
    await db.update(products)
      .set({ 
        stock: product.stock - transferQty,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));

    // Find or create product at destination
    const [existingDestProduct] = await db.select().from(products).where(
      and(
        eq(products.shopId, toShopId),
        eq(products.categoryId, product.categoryId),
        eq(products.accessoryCatalogId, product.accessoryCatalogId),
        eq(products.barcode, product.barcode)
      )
    ).limit(1);

    if (existingDestProduct) {
      await db.update(products)
        .set({ 
          stock: existingDestProduct.stock + transferQty,
          updatedAt: new Date()
        })
        .where(eq(products.id, existingDestProduct.id));
      destinationProductId = existingDestProduct.id;
    } else {
      const [newDestProduct] = await db.insert(products).values({
        shopId: toShopId,
        categoryId: product.categoryId,
        mobileCatalogId: product.mobileCatalogId,
        accessoryCatalogId: product.accessoryCatalogId,
        customName: product.customName,
        sku: product.sku ? `${product.sku}-TR` : null,
        barcode: product.barcode,
        stock: transferQty,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice,
        vendorId: product.vendorId,
        lowStockThreshold: product.lowStockThreshold
      }).returning();
      destinationProductId = newDestProduct.id;
    }

    const [newTransfer] = await db.insert(stockTransfers).values({
      productId,
      fromShopId,
      toShopId,
      quantity: transferQty,
      status: 'completed',
      notes: notes || null,
      createdBy: userId
    }).returning();

    try {
      await logActivity(userId, 'transfer', 'stock_transfer', newTransfer.id, {
        productId,
        productName: product.customName,
        productBarcode: product.barcode,
        fromShopId,
        fromShopName: fromShop?.name,
        toShopId,
        toShopName: toShop?.name,
        quantity: transferQty
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

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

    // Search for phone unit by IMEI
    const [phoneUnit] = await db.select().from(phoneUnits).where(
      and(
        or(eq(phoneUnits.imeiPrimary, imei), eq(phoneUnits.imeiSecondary, imei)),
        inArray(phoneUnits.shopId, userShopIds),
        eq(phoneUnits.status, 'in_stock')
      )
    ).limit(1);

    if (!phoneUnit) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    // Get associated product
    const [product] = await db.select().from(products).where(
      eq(products.id, phoneUnit.productId)
    ).limit(1);

    res.json({ product, phoneUnit });
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
