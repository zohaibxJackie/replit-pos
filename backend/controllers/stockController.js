import { db } from "../config/database.js";
import {
  stock,
  variant,
  product,
  categories,
  brand,
  vendors,
  shops,
  saleItems,
} from "../../shared/schema.js";
import { eq, sql, ilike, and, desc, or, inArray, ne } from "drizzle-orm";
import {
  createStockSchema,
  updateStockSchema,
  bulkCreateStockSchema,
  stockFilterSchema,
} from "../validators/inventory.js";
import { paginationHelper } from "../utils/helpers.js";
import { logActivity } from "./notificationController.js";

export const getStock = async (req, res) => {
  try {
    const validation = stockFilterSchema.safeParse(req.query);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const {
      page = 1,
      limit = 20,
      shopId: queryShopId,
      variantId,
      stockStatus,
      condition,
      vendorId,
      isSold,
      search,
    } = validation.data;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const userShopIds = req.userShopIds || [];

    if (userShopIds.length === 0) {
      return res.status(400).json({ error: req.t("stock.shop_required") });
    }

    let conditions = [];

    if (queryShopId && userShopIds.includes(queryShopId)) {
      conditions.push(eq(stock.shopId, queryShopId));
    } else {
      conditions.push(inArray(stock.shopId, userShopIds));
    }

    if (variantId) {
      conditions.push(eq(stock.variantId, variantId));
    }

    if (stockStatus) {
      conditions.push(eq(stock.stockStatus, stockStatus));
    }

    if (condition) {
      conditions.push(eq(stock.condition, condition));
    }

    if (vendorId) {
      conditions.push(eq(stock.vendorId, vendorId));
    }

    if (isSold !== undefined) {
      conditions.push(eq(stock.isSold, isSold));
    }

    if (search) {
      conditions.push(
        or(
          ilike(stock.primaryImei, `%${search}%`),
          ilike(stock.secondaryImei, `%${search}%`),
          ilike(stock.serialNumber, `%${search}%`),
          ilike(stock.barcode, `%${search}%`),
          ilike(variant.variantName, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    const stockList = await db
      .select({
        id: stock.id,
        variantId: stock.variantId,
        shopId: stock.shopId,
        saleItemId: stock.saleItemId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        serialNumber: stock.serialNumber,
        barcode: stock.barcode,
        purchasePrice: stock.purchasePrice,
        salePrice: stock.salePrice,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        notes: stock.notes,
        condition: stock.condition,
        lowStockThreshold: stock.lowStockThreshold,
        vendorId: stock.vendorId,
        isActive: stock.isActive,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        productName: product.name,
        categoryName: categories.name,
        brandName: brand.name,
        shopName: shops.name,
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(shops, eq(stock.shopId, shops.id))
      .where(whereClause)
      .orderBy(desc(stock.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .where(whereClause);

    res.json({
      stock: stockList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get stock error:", error);
    res.status(500).json({ error: req.t("stock.fetch_failed") });
  }
};

export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db
      .select({
        id: stock.id,
        variantId: stock.variantId,
        shopId: stock.shopId,
        saleItemId: stock.saleItemId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        serialNumber: stock.serialNumber,
        barcode: stock.barcode,
        purchasePrice: stock.purchasePrice,
        salePrice: stock.salePrice,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        notes: stock.notes,
        condition: stock.condition,
        lowStockThreshold: stock.lowStockThreshold,
        vendorId: stock.vendorId,
        isActive: stock.isActive,
        createdAt: stock.createdAt,
        updatedAt: stock.updatedAt,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        productName: product.name,
        categoryName: categories.name,
        brandName: brand.name,
        shopName: shops.name,
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(shops, eq(stock.shopId, shops.id))
      .where(and(eq(stock.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t("stock.not_found") });
    }

    let vendorData = null;
    if (stockItem.vendorId) {
      const [v] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, stockItem.vendorId))
        .limit(1);
      vendorData = v;
    }

    res.json({ stock: stockItem, vendor: vendorData });
  } catch (error) {
    console.error("Get stock by id error:", error);
    res.status(500).json({ error: req.t("stock.fetch_failed") });
  }
};

export const getStockByImei = async (req, res) => {
  try {
    const { imei } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db
      .select({
        id: stock.id,
        variantId: stock.variantId,
        shopId: stock.shopId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        serialNumber: stock.serialNumber,
        barcode: stock.barcode,
        purchasePrice: stock.purchasePrice,
        salePrice: stock.salePrice,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        condition: stock.condition,
        variantName: variant.variantName,
        productName: product.name,
        brandName: brand.name,
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(
        and(
          or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
          inArray(stock.shopId, userShopIds)
        )
      )
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t("stock.not_found") });
    }

    res.json({ stock: stockItem });
  } catch (error) {
    console.error("Get stock by IMEI error:", error);
    res.status(500).json({ error: req.t("stock.fetch_failed") });
  }
};

export const getStockByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db
      .select({
        id: stock.id,
        variantId: stock.variantId,
        shopId: stock.shopId,
        primaryImei: stock.primaryImei,
        secondaryImei: stock.secondaryImei,
        serialNumber: stock.serialNumber,
        barcode: stock.barcode,
        purchasePrice: stock.purchasePrice,
        salePrice: stock.salePrice,
        stockStatus: stock.stockStatus,
        isSold: stock.isSold,
        condition: stock.condition,
        variantName: variant.variantName,
        productName: product.name,
        brandName: brand.name,
      })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(
        and(eq(stock.barcode, barcode), inArray(stock.shopId, userShopIds))
      )
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t("stock.not_found") });
    }

    res.json({ stock: stockItem });
  } catch (error) {
    console.error("Get stock by barcode error:", error);
    res.status(500).json({ error: req.t("stock.fetch_failed") });
  }
};

const checkImeiUniqueness = async (imei, excludeStockId = null) => {
  if (!imei) return true;

  let conditions = [
    or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
  ];

  if (excludeStockId) {
    conditions.push(ne(stock.id, excludeStockId));
  }

  const [existing] = await db
    .select()
    .from(stock)
    .where(and(...conditions))
    .limit(1);
  return !existing;
};

export const createStock = async (req, res) => {
  try {
    const validation = createStockSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const {
      variantId,
      shopId,
      primaryImei,
      secondaryImei,
      serialNumber,
      barcode,
      purchasePrice,
      salePrice,
      stockStatus,
      notes,
      condition,
      lowStockThreshold,
      vendorId,
    } = validation.data;

    const userShopIds = req.userShopIds || [];
    const hasFullAccess =
      req.user?.role === "super_admin" || req.user?.role === "admin";

    if (!hasFullAccess && !userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t("stock.shop_access_denied") });
    }

    const [var_] = await db
      .select()
      .from(variant)
      .where(eq(variant.id, variantId))
      .limit(1);
    if (!var_) {
      return res.status(400).json({ error: req.t("variant.not_found") });
    }

    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, shopId))
      .limit(1);
    if (!shop) {
      return res.status(400).json({ error: req.t("shop.not_found") });
    }

    if (primaryImei) {
      if (!(await checkImeiUniqueness(primaryImei))) {
        return res.status(409).json({ error: req.t("stock.imei_exists") });
      }
    }

    if (secondaryImei) {
      if (!(await checkImeiUniqueness(secondaryImei))) {
        return res.status(409).json({ error: req.t("stock.imei_exists") });
      }
    }

    if (primaryImei && secondaryImei && primaryImei === secondaryImei) {
      return res.status(400).json({ error: req.t("stock.imei_duplicate") });
    }

    if (vendorId) {
      const [v] = await db
        .select()
        .from(vendors)
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId)))
        .limit(1);
      if (!v) {
        return res.status(400).json({ error: req.t("stock.invalid_vendor") });
      }
    }

    const [newStock] = await db
      .insert(stock)
      .values({
        variantId,
        shopId,
        primaryImei: primaryImei || null,
        secondaryImei: secondaryImei || null,
        serialNumber: serialNumber || null,
        barcode: barcode || null,
        purchasePrice: purchasePrice?.toString() || null,
        salePrice: salePrice?.toString() || null,
        stockStatus: stockStatus || "in_stock",
        notes: notes || null,
        condition: condition || "new",
        lowStockThreshold: lowStockThreshold || 5,
        vendorId: vendorId || null,
      })
      .returning();

    try {
      await logActivity(
        req.user?.id,
        "create",
        "stock",
        newStock.id,
        {
          variantId,
          shopId,
          primaryImei: newStock.primaryImei,
          secondaryImei: newStock.secondaryImei,
          salePrice: newStock.salePrice,
        },
        req
      );
    } catch (logError) {
      console.error("Activity logging failed:", logError);
    }

    res.status(201).json({ stock: newStock });
  } catch (error) {
    console.error("Create stock error:", error);
    res.status(500).json({ error: req.t("stock.create_failed") });
  }
};

export const bulkCreateStock = async (req, res) => {
  try {
    const validation = bulkCreateStockSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const {
      variantId,
      shopId,
      purchasePrice,
      salePrice,
      condition,
      lowStockThreshold,
      vendorId,
      quantity,
      items,
    } = validation.data;

    const userShopIds = req.userShopIds || [];
    const hasFullAccess =
      req.user?.role === "super_admin" || req.user?.role === "admin";

    if (!hasFullAccess && !userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t("stock.shop_access_denied") });
    }

    const [var_] = await db
      .select()
      .from(variant)
      .where(eq(variant.id, variantId))
      .limit(1);
    if (!var_) {
      return res.status(400).json({ error: req.t("variant.not_found") });
    }

    const allImeis = [];
    for (const item of items) {
      if (item.primaryImei) allImeis.push(item.primaryImei);
      if (item.secondaryImei) allImeis.push(item.secondaryImei);
    }

    const uniqueImeis = new Set(allImeis);
    if (uniqueImeis.size !== allImeis.length) {
      return res
        .status(400)
        .json({ error: req.t("stock.duplicate_imei_in_batch") });
    }

    for (const imei of allImeis) {
      if (!(await checkImeiUniqueness(imei))) {
        return res
          .status(409)
          .json({ error: req.t("stock.imei_exists") + `: ${imei}` });
      }
    }

    if (vendorId) {
      const [v] = await db
        .select()
        .from(vendors)
        .where(and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId)))
        .limit(1);
      if (!v) {
        return res.status(400).json({ error: req.t("stock.invalid_vendor") });
      }
    }

    const createdItems = [];
    for (const item of items) {
      const [newStock] = await db
        .insert(stock)
        .values({
          variantId,
          shopId,
          primaryImei: item.primaryImei || null,
          secondaryImei: item.secondaryImei || null,
          serialNumber: item.serialNumber || null,
          barcode: item.barcode || null,
          purchasePrice: purchasePrice?.toString() || null,
          salePrice: salePrice?.toString() || null,
          stockStatus: "in_stock",
          notes: item.notes || null,
          condition: condition || "new",
          lowStockThreshold: lowStockThreshold || 5,
          vendorId: vendorId || null,
        })
        .returning();
      createdItems.push(newStock);
    }

    try {
      await logActivity(
        req.user?.id,
        "bulk_create",
        "stock",
        null,
        {
          variantId,
          shopId,
          quantity,
          stockIds: createdItems.map((s) => s.id),
        },
        req
      );
    } catch (logError) {
      console.error("Activity logging failed:", logError);
    }

    res.status(201).json({
      stock: createdItems,
      message: req.t("stock.bulk_created", { count: quantity }),
    });
  } catch (error) {
    console.error("Bulk create stock error:", error);
    res.status(500).json({ error: req.t("stock.bulk_create_failed") });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateStockSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const userShopIds = req.userShopIds || [];

    const [existingStock] = await db
      .select()
      .from(stock)
      .where(and(eq(stock.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!existingStock) {
      return res.status(404).json({ error: req.t("stock.not_found") });
    }

    const data = validation.data;

    if (data.primaryImei && data.primaryImei !== existingStock.primaryImei) {
      if (!(await checkImeiUniqueness(data.primaryImei, id))) {
        return res.status(409).json({ error: req.t("stock.imei_exists") });
      }
    }

    if (
      data.secondaryImei &&
      data.secondaryImei !== existingStock.secondaryImei
    ) {
      if (!(await checkImeiUniqueness(data.secondaryImei, id))) {
        return res.status(409).json({ error: req.t("stock.imei_exists") });
      }
    }

    if (data.vendorId) {
      const [v] = await db
        .select()
        .from(vendors)
        .where(
          and(
            eq(vendors.id, data.vendorId),
            eq(vendors.shopId, existingStock.shopId)
          )
        )
        .limit(1);
      if (!v) {
        return res.status(400).json({ error: req.t("stock.invalid_vendor") });
      }
    }

    const updateData = { updatedAt: new Date() };

    if (data.variantId !== undefined) updateData.variantId = data.variantId;
    if (data.saleItemId !== undefined) updateData.saleItemId = data.saleItemId;
    if (data.primaryImei !== undefined)
      updateData.primaryImei = data.primaryImei;
    if (data.secondaryImei !== undefined)
      updateData.secondaryImei = data.secondaryImei;
    if (data.serialNumber !== undefined)
      updateData.serialNumber = data.serialNumber;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.purchasePrice !== undefined)
      updateData.purchasePrice = data.purchasePrice?.toString() || null;
    if (data.salePrice !== undefined)
      updateData.salePrice = data.salePrice?.toString() || null;
    if (data.stockStatus !== undefined)
      updateData.stockStatus = data.stockStatus;
    if (data.isSold !== undefined) updateData.isSold = data.isSold;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.lowStockThreshold !== undefined)
      updateData.lowStockThreshold = data.lowStockThreshold;
    if (data.vendorId !== undefined) updateData.vendorId = data.vendorId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [updatedStock] = await db
      .update(stock)
      .set(updateData)
      .where(eq(stock.id, id))
      .returning();

    try {
      await logActivity(
        req.user?.id,
        "update",
        "stock",
        id,
        {
          changes: updateData,
        },
        req
      );
    } catch (logError) {
      console.error("Activity logging failed:", logError);
    }

    res.json({ stock: updatedStock });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({ error: req.t("stock.update_failed") });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    const userShopIds = req.userShopIds || [];

    const [existingStock] = await db
      .select()
      .from(stock)
      .where(and(eq(stock.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!existingStock) {
      return res.status(404).json({ error: req.t("stock.not_found") });
    }

    if (existingStock.isSold || existingStock.saleItemId) {
      return res.status(400).json({ error: req.t("stock.already_sold") });
    }

    await db.delete(stock).where(eq(stock.id, id));

    try {
      await logActivity(
        req.user?.id,
        "delete",
        "stock",
        id,
        {
          primaryImei: existingStock.primaryImei,
          variantId: existingStock.variantId,
        },
        req
      );
    } catch (logError) {
      console.error("Activity logging failed:", logError);
    }

    res.json({ message: req.t("stock.deleted") });
  } catch (error) {
    console.error("Delete stock error:", error);
    res.status(500).json({ error: req.t("stock.delete_failed") });
  }
};

export const getStockSummary = async (req, res) => {
  try {
    const userShopIds = req.userShopIds || [];
    const { shopId: queryShopId } = req.query;

    let shopCondition;
    if (queryShopId && userShopIds.includes(queryShopId)) {
      shopCondition = eq(stock.shopId, queryShopId);
    } else {
      shopCondition = inArray(stock.shopId, userShopIds);
    }

    const summary = await db
      .select({
        stockStatus: stock.stockStatus,
        count: sql`count(*)::int`,
      })
      .from(stock)
      .where(shopCondition)
      .groupBy(stock.stockStatus);

    const totalValue = await db
      .select({
        total: sql`COALESCE(SUM(CAST(${stock.salePrice} AS DECIMAL)), 0)::numeric`,
      })
      .from(stock)
      .where(and(shopCondition, eq(stock.stockStatus, "in_stock")));

    res.json({
      summary,
      totalValue: totalValue[0]?.total || 0,
    });
  } catch (error) {
    console.error("Get stock summary error:", error);
    res.status(500).json({ error: req.t("stock.fetch_failed") });
  }
};



export default {
  getStock,
  getStockById,
  getStockByImei,
  getStockByBarcode,
  createStock,
  bulkCreateStock,
  updateStock,
  deleteStock,
  getStockSummary,
};
