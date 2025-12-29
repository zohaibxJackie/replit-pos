import { db } from "../config/database.js";
import {
  stockTransfers,
  stockTransferItems,
  stock,
  shops,
  variant,
  product,
  brand,
  categories,
} from "../../shared/schema.js";
import { eq, and, desc, or, inArray } from "drizzle-orm";
import { logActivity } from "./notificationController.js";

export const getStockTransfers = async (req, res) => {
  try {
    const userShopIds = req.userShopIds || [];

    const transfers = await db
      .select()
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
    console.error("Get stock transfers error:", error);
    res.status(500).json({ error: req.t("stock_transfer.fetch_failed") });
  }
};

export const createStockTransfer = async (req, res) => {
  try {
    const { productId, fromShopId, toShopId, quantity, notes } = req.body;
    const userId = req.user.id;
    const userShopIds = req.userShopIds || [];

    if (!productId || !fromShopId || !toShopId || !quantity) {
      return res
        .status(400)
        .json({ error: req.t("stock_transfer.missing_fields") });
    }

    if (fromShopId === toShopId) {
      return res.status(400).json({ error: req.t("stock_transfer.same_shop") });
    }

    if (!userShopIds.includes(fromShopId)) {
      return res
        .status(403)
        .json({ error: req.t("stock_transfer.unauthorized_from_shop") });
    }

    if (!userShopIds.includes(toShopId)) {
      return res
        .status(403)
        .json({ error: req.t("stock_transfer.unauthorized_to_shop") });
    }

    const [toShop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, toShopId))
      .limit(1);
    if (!toShop) {
      return res
        .status(404)
        .json({ error: req.t("stock_transfer.target_shop_not_found") });
    }

    const [fromShop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, fromShopId))
      .limit(1);

    // Get available stock items for this product in the source shop
    // The productId from frontend could be the variant ID or product ID, so we'll fetch by variant first
    const availableStockItems = await db
      .select({
        id: stock.id,
        shopId: stock.shopId,
        variantId: stock.variantId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        barcode: stock.barcode,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        variant: {
          id: variant.id,
          variantName: variant.variantName,
        },
        product: {
          id: product.id,
          name: product.name,
        },
        brand: {
          id: brand.id,
          name: brand.name,
        },
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(
        and(
          eq(stock.shopId, fromShopId),
          eq(stock.stockStatus, "in_stock"),
          eq(stock.isActive, true),
          eq(stock.isSold, false),
          or(eq(variant.id, productId), eq(product.id, productId))
        )
      )
      .limit(quantity);

    if (availableStockItems.length === 0) {
      return res
        .status(404)
        .json({
          error:
            req.t("stock_transfer.stock_not_found") ||
            "No available stock items for transfer",
        });
    }

    if (availableStockItems.length < quantity) {
      return res
        .status(400)
        .json({
          error: `Only ${availableStockItems.length} items available, requested ${quantity}`,
        });
    }

    // Create transfer record
    const [newTransfer] = await db
      .insert(stockTransfers)
      .values({
        fromShopId,
        toShopId,
        status: "completed",
        notes: notes || null,
        createdBy: userId,
      })
      .returning();

    // Update shop for selected stock items and create transfer items
    const stockIds = availableStockItems
      .slice(0, quantity)
      .map((item) => item.id);

    await db
      .update(stock)
      .set({
        shopId: toShopId,
        stockStatus: "in_stock",
        updatedAt: new Date(),
      })
      .where(and(eq(stock.shopId, fromShopId), inArray(stock.id, stockIds)));

    // Create transfer items
    for (const stockId of stockIds) {
      await db.insert(stockTransferItems).values({
        stockTransferId: newTransfer.id,
        stockId,
      });
    }

    try {
      await logActivity(
        userId,
        "transfer",
        "stock_transfer",
        newTransfer.id,
        {
          productId,
          quantity: quantity,
          itemsTransferred: stockIds.length,
          fromShopId,
          fromShopName: fromShop?.name,
          toShopId,
          toShopName: toShop?.name,
        },
        req
      );
    } catch (logError) {
      console.error("Activity logging failed:", logError);
    }

    res
      .status(201)
      .json({ transfer: newTransfer, transferredCount: stockIds.length });
  } catch (error) {
    console.error("Create stock transfer error:", error);
    res.status(500).json({ error: req.t("stock_transfer.create_failed") });
  }
};

export const getProductByImeiForTransfer = async (req, res) => {
  try {
    const { imei } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db
      .select({
        id: stock.id,
        shopId: stock.shopId,
        variantId: stock.variantId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        barcode: stock.barcode,
        purchasePrice: stock.purchasePrice,
        salePrice: stock.salePrice,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        condition: stock.condition,
        variant: {
          id: variant.id,
          variantName: variant.variantName,
          color: variant.color,
          storageSize: variant.storageSize,
        },
        product: {
          id: product.id,
          name: product.name,
        },
        brand: {
          id: brand.id,
          name: brand.name,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .where(
        and(
          or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
          inArray(stock.shopId, userShopIds),
          eq(stock.stockStatus, "in_stock"),
          eq(stock.isActive, true),
          eq(stock.isSold, false)
        )
      )
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t("product.not_found") });
    }

    res.json({ product: stockItem });
  } catch (error) {
    console.error("Get product by IMEI for transfer error:", error);
    res.status(500).json({ error: req.t("product.fetch_failed") });
  }
};

export default {
  getStockTransfers,
  createStockTransfer,
  getProductByImeiForTransfer,
};
