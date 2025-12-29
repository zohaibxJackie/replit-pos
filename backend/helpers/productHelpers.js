import { db } from "../config/database.js";
import {
  stock,
  stockBatches,
  variant,
  product,
  brand,
  categories,
  vendors,
} from "../../shared/schema.js";
import { eq, and, desc, sql, or, ne, inArray } from "drizzle-orm";

export const fetchMobileProducts = async ({
  userShopIds,
  queryShopId,
  search,
  lowStock,
  offset,
  pageLimit,
}) => {
  let conditions = [eq(stock.isActive, true)];

  if (queryShopId && userShopIds.includes(queryShopId)) {
    conditions.push(eq(stock.shopId, queryShopId));
  } else {
    conditions.push(inArray(stock.shopId, userShopIds));
  }

  if (search) {
    conditions.push(
      or(
        sql`COALESCE(${stock.barcode}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${stock.primaryImei}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${stock.secondaryImei}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${stock.serialNumber}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${variant.variantName}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${product.name}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${brand.name}, '') ILIKE ${`%${search}%`}`
      )
    );
  }

  if (lowStock === "true") {
    const lowStockVariants = db
      .select({ variantId: stock.variantId })
      .from(stock)
      .where(
        and(
          eq(stock.isActive, true),
          eq(stock.isSold, false),
          ne(stock.stockStatus, "sold")
        )
      )
      .groupBy(stock.variantId)
      .having(sql`count(*) <= COALESCE(MIN(${stock.lowStockThreshold}), 5)`);

    conditions.push(sql`${stock.variantId} IN (${lowStockVariants})`);
  }

  const whereClause = and(...conditions);

  const productList = await db
    .select({
      id: stock.id,
      shopId: stock.shopId,
      variantId: stock.variantId,
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
      vendorId: stock.vendorId,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
      variant: {
        id: variant.id,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        sku: variant.sku,
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
    .where(whereClause)
    .orderBy(desc(stock.createdAt))
    .limit(pageLimit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(stock)
    .leftJoin(variant, eq(stock.variantId, variant.id))
    .leftJoin(product, eq(variant.productId, product.id))
    .leftJoin(brand, eq(product.brandId, brand.id))
    .leftJoin(categories, eq(product.categoryId, categories.id))
    .where(whereClause);

  return { products: productList, total: count };
};

export const fetchAccessoryProducts = async ({
  userShopIds,
  queryShopId,
  search,
  lowStock,
  offset,
  pageLimit,
}) => {
  let conditions = [eq(stockBatches.isActive, true)];

  if (queryShopId && userShopIds.includes(queryShopId)) {
    conditions.push(eq(stockBatches.shopId, queryShopId));
  } else {
    conditions.push(inArray(stockBatches.shopId, userShopIds));
  }

  if (search) {
    conditions.push(
      or(
        sql`COALESCE(${stockBatches.barcode}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${variant.variantName}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${product.name}, '') ILIKE ${`%${search}%`}`,
        sql`COALESCE(${brand.name}, '') ILIKE ${`%${search}%`}`
      )
    );
  }

  if (lowStock === "true") {
    conditions.push(
      sql`${stockBatches.quantity} <= ${stockBatches.lowStockThreshold}`
    );
  }

  const whereClause = and(...conditions);

  const productList = await db
    .select({
      id: stockBatches.id,
      shopId: stockBatches.shopId,
      variantId: stockBatches.variantId,
      barcode: stockBatches.barcode,
      quantity: stockBatches.quantity,
      purchasePrice: stockBatches.purchasePrice,
      salePrice: stockBatches.salePrice,
      lowStockThreshold: stockBatches.lowStockThreshold,
      vendorId: stockBatches.vendorId,
      notes: stockBatches.notes,
      createdAt: stockBatches.createdAt,
      updatedAt: stockBatches.updatedAt,
      variant: {
        id: variant.id,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        sku: variant.sku,
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
    .from(stockBatches)
    .leftJoin(variant, eq(stockBatches.variantId, variant.id))
    .leftJoin(product, eq(variant.productId, product.id))
    .leftJoin(brand, eq(product.brandId, brand.id))
    .leftJoin(categories, eq(product.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(stockBatches.createdAt))
    .limit(pageLimit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql`count(*)::int` })
    .from(stockBatches)
    .leftJoin(variant, eq(stockBatches.variantId, variant.id))
    .leftJoin(product, eq(variant.productId, product.id))
    .leftJoin(brand, eq(product.brandId, brand.id))
    .leftJoin(categories, eq(product.categoryId, categories.id))
    .where(whereClause);

  return { products: productList, total: count };
};
