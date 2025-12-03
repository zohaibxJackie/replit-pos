import { db } from '../config/database.js';
import { products, categories, vendors, mobileCatalog, accessoryCatalog } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or, lte, ne } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, categoryId, lowStock, productType } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.userShopIds?.[0];

    let conditions = [eq(products.shopId, shopId)];

    if (search) {
      conditions.push(
        or(
          sql`COALESCE(${products.customName}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.barcode}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.sku}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.imei1}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.imei2}, '') ILIKE ${`%${search}%`}`
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (productType) {
      conditions.push(eq(products.productType, productType));
    }

    if (lowStock === 'true') {
      conditions.push(lte(products.stock, products.lowStockThreshold));
    }

    const whereClause = and(...conditions);

    const productList = await db.select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(products)
      .where(whereClause);

    res.json({
      products: productList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [product] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    let category = null;
    if (product.categoryId) {
      const [cat] = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
      category = cat;
    }

    let vendor = null;
    if (product.vendorId) {
      const [v] = await db.select().from(vendors).where(eq(vendors.id, product.vendorId)).limit(1);
      vendor = v;
    }

    let catalogItem = null;
    if (product.productType === 'mobile' && product.mobileCatalogId) {
      const [m] = await db.select().from(mobileCatalog).where(eq(mobileCatalog.id, product.mobileCatalogId)).limit(1);
      catalogItem = m;
    } else if (product.productType === 'accessory' && product.accessoryCatalogId) {
      const [a] = await db.select().from(accessoryCatalog).where(eq(accessoryCatalog.id, product.accessoryCatalogId)).limit(1);
      catalogItem = a;
    }

    res.json({ product, category, vendor, catalogItem });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const [product] = await db.select().from(products).where(
      and(eq(products.barcode, barcode), eq(products.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductByImei = async (req, res) => {
  try {
    const { imei } = req.params;

    const [product] = await db.select().from(products).where(
      and(
        or(eq(products.imei1, imei), eq(products.imei2, imei)),
        eq(products.shopId, req.userShopIds?.[0])
      )
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by IMEI error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

const checkImeiUniqueness = async (imei, shopId, excludeProductId = null) => {
  if (!imei) return true;
  
  let conditions = [
    eq(products.shopId, shopId),
    or(eq(products.imei1, imei), eq(products.imei2, imei))
  ];
  
  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }
  
  const [existing] = await db.select().from(products).where(and(...conditions)).limit(1);
  return !existing;
};

const checkBarcodeUniqueness = async (barcode, shopId, excludeProductId = null) => {
  if (!barcode) return true;
  
  let conditions = [
    eq(products.shopId, shopId),
    eq(products.barcode, barcode)
  ];
  
  if (excludeProductId) {
    conditions.push(ne(products.id, excludeProductId));
  }
  
  const [existing] = await db.select().from(products).where(and(...conditions)).limit(1);
  return !existing;
};

export const createProduct = async (req, res) => {
  try {
    const { 
      productType, 
      mobileCatalogId, 
      accessoryCatalogId,
      customName,
      categoryId,
      sku,
      imei1, 
      imei2,
      barcode,
      stock,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold
    } = req.validatedBody;

    const shopId = req.userShopIds?.[0];

    if (vendorId) {
      const [vendorExists] = await db.select().from(vendors).where(
        and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId))
      ).limit(1);
      if (!vendorExists) {
        return res.status(400).json({ error: req.t('product.invalid_vendor') });
      }
    }

    if (!(await checkBarcodeUniqueness(barcode, shopId))) {
      return res.status(409).json({ error: req.t('product.barcode_exists') });
    }

    if (!(await checkImeiUniqueness(imei1, shopId))) {
      return res.status(409).json({ error: req.t('product.imei_exists') });
    }

    if (!(await checkImeiUniqueness(imei2, shopId))) {
      return res.status(409).json({ error: req.t('product.imei_exists') });
    }

    if (imei1 && imei2 && imei1 === imei2) {
      return res.status(400).json({ error: req.t('product.imei_duplicate') });
    }

    if (mobileCatalogId) {
      const [catalogExists] = await db.select().from(mobileCatalog).where(
        eq(mobileCatalog.id, mobileCatalogId)
      ).limit(1);
      if (!catalogExists) {
        return res.status(400).json({ error: req.t('product.invalid_mobile_catalog') });
      }
    }

    if (accessoryCatalogId) {
      const [catalogExists] = await db.select().from(accessoryCatalog).where(
        eq(accessoryCatalog.id, accessoryCatalogId)
      ).limit(1);
      if (!catalogExists) {
        return res.status(400).json({ error: req.t('product.invalid_accessory_catalog') });
      }
    }

    const [newProduct] = await db.insert(products).values({
      shopId,
      productType,
      mobileCatalogId: productType === 'mobile' ? (mobileCatalogId || null) : null,
      accessoryCatalogId: productType === 'accessory' ? (accessoryCatalogId || null) : null,
      customName: customName || null,
      categoryId: categoryId || null,
      sku: sku || null,
      imei1: productType === 'mobile' ? (imei1 || null) : null,
      imei2: productType === 'mobile' ? (imei2 || null) : null,
      barcode: barcode || null,
      stock: stock || 0,
      purchasePrice: purchasePrice?.toString() || null,
      salePrice: salePrice.toString(),
      vendorId: vendorId || null,
      lowStockThreshold: lowStockThreshold || 5
    }).returning();

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: req.t('product.create_failed') });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customName,
      categoryId,
      sku,
      imei1,
      imei2,
      barcode,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold
    } = req.validatedBody;

    const shopId = req.userShopIds?.[0];

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, shopId))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    if (vendorId !== undefined && vendorId !== null) {
      const [vendorExists] = await db.select().from(vendors).where(
        and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId))
      ).limit(1);
      if (!vendorExists) {
        return res.status(400).json({ error: req.t('product.invalid_vendor') });
      }
    }

    if (existingProduct.productType === 'accessory') {
      if (imei1 !== undefined || imei2 !== undefined) {
        return res.status(400).json({ error: req.t('product.imei_not_allowed_for_accessory') });
      }
    }

    if (existingProduct.productType === 'mobile') {
      if (imei1 !== undefined && !imei1) {
        return res.status(400).json({ error: req.t('product.imei1_required_for_mobile') });
      }
    }

    const finalCustomName = customName !== undefined ? customName : existingProduct.customName;
    const finalMobileCatalogId = existingProduct.mobileCatalogId;
    const finalAccessoryCatalogId = existingProduct.accessoryCatalogId;
    
    if (existingProduct.productType === 'mobile' && !finalCustomName && !finalMobileCatalogId) {
      return res.status(400).json({ error: req.t('product.name_or_catalog_required') });
    }
    if (existingProduct.productType === 'accessory' && !finalCustomName && !finalAccessoryCatalogId) {
      return res.status(400).json({ error: req.t('product.name_or_catalog_required') });
    }

    if (barcode !== undefined && barcode !== null) {
      if (!(await checkBarcodeUniqueness(barcode, shopId, id))) {
        return res.status(409).json({ error: req.t('product.barcode_exists') });
      }
    }

    if (imei1 !== undefined && imei1 !== null) {
      if (!(await checkImeiUniqueness(imei1, shopId, id))) {
        return res.status(409).json({ error: req.t('product.imei_exists') });
      }
    }

    if (imei2 !== undefined && imei2 !== null) {
      if (!(await checkImeiUniqueness(imei2, shopId, id))) {
        return res.status(409).json({ error: req.t('product.imei_exists') });
      }
    }

    const finalImei1 = imei1 !== undefined ? imei1 : existingProduct.imei1;
    const finalImei2 = imei2 !== undefined ? imei2 : existingProduct.imei2;
    
    if (finalImei1 && finalImei2 && finalImei1 === finalImei2) {
      return res.status(400).json({ error: req.t('product.imei_duplicate') });
    }

    const updateData = { updatedAt: new Date() };
    if (customName !== undefined) updateData.customName = customName;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (sku !== undefined) updateData.sku = sku;
    if (existingProduct.productType === 'mobile') {
      if (imei1 !== undefined) updateData.imei1 = imei1;
      if (imei2 !== undefined) updateData.imei2 = imei2;
    }
    if (barcode !== undefined) updateData.barcode = barcode;
    if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice != null ? purchasePrice.toString() : null;
    if (salePrice !== undefined && salePrice != null) updateData.salePrice = salePrice.toString();
    if (vendorId !== undefined) updateData.vendorId = vendorId;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

    const [updatedProduct] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: req.t('product.update_failed') });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.validatedBody;

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    let newStock;
    switch (type) {
      case 'add':
        newStock = existingProduct.stock + quantity;
        break;
      case 'subtract':
        newStock = existingProduct.stock - quantity;
        if (newStock < 0) {
          return res.status(400).json({ error: req.t('product.insufficient_stock') });
        }
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({ error: req.t('product.invalid_stock_type') });
    }

    const [updatedProduct] = await db.update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: req.t('product.stock_update_failed') });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    await db.delete(products).where(eq(products.id, id));

    res.json({ message: req.t('product.deleted') });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: req.t('product.delete_failed') });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const shopId = req.userShopIds?.[0];

    const lowStockProducts = await db.select()
      .from(products)
      .where(
        and(
          eq(products.shopId, shopId),
          lte(products.stock, products.lowStockThreshold)
        )
      )
      .orderBy(products.stock);

    res.json({ products: lowStockProducts });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: req.t('product.low_stock_fetch_failed') });
  }
};

export const getMobileCatalog = async (req, res) => {
  try {
    const { search, brand } = req.query;
    
    let conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(mobileCatalog.name, `%${search}%`),
          ilike(mobileCatalog.brand, `%${search}%`)
        )
      );
    }
    
    if (brand) {
      conditions.push(eq(mobileCatalog.brand, brand));
    }

    let query = db.select().from(mobileCatalog);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const catalog = await query.orderBy(mobileCatalog.brand, mobileCatalog.name);

    res.json({ catalog });
  } catch (error) {
    console.error('Get mobile catalog error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getAccessoryCatalog = async (req, res) => {
  try {
    const { search, brand } = req.query;
    
    let conditions = [];
    
    if (search) {
      conditions.push(
        or(
          ilike(accessoryCatalog.name, `%${search}%`),
          ilike(accessoryCatalog.brand, `%${search}%`)
        )
      );
    }
    
    if (brand) {
      conditions.push(eq(accessoryCatalog.brand, brand));
    }

    let query = db.select().from(accessoryCatalog);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const catalog = await query.orderBy(accessoryCatalog.brand, accessoryCatalog.name);

    res.json({ catalog });
  } catch (error) {
    console.error('Get accessory catalog error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogBrands = async (req, res) => {
  try {
    const brands = await db.selectDistinct({ brand: mobileCatalog.brand })
      .from(mobileCatalog)
      .orderBy(mobileCatalog.brand);

    res.json({ brands: brands.map(b => b.brand) });
  } catch (error) {
    console.error('Get mobile catalog brands error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getAccessoryCatalogBrands = async (req, res) => {
  try {
    const brands = await db.selectDistinct({ brand: accessoryCatalog.brand })
      .from(accessoryCatalog)
      .orderBy(accessoryCatalog.brand);

    res.json({ brands: brands.map(b => b.brand) });
  } catch (error) {
    console.error('Get accessory catalog brands error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export default {
  getProducts,
  getProductById,
  getProductByBarcode,
  getProductByImei,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts,
  getMobileCatalog,
  getAccessoryCatalog,
  getMobileCatalogBrands,
  getAccessoryCatalogBrands
};
