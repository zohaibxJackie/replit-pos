import { db } from '../config/database.js';
import { products, categories, vendors, mobileCatalog, accessoryCatalog, phoneUnits } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or, lte, ne, inArray } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';
import { logActivity } from './notificationController.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, categoryId, lowStock, shopId: queryShopId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const userShopIds = req.userShopIds || [];

    if (userShopIds.length === 0) {
      return res.status(400).json({ error: req.t('product.shop_required') || 'Shop ID is required' });
    }

    let conditions = [];

    if (queryShopId && userShopIds.includes(queryShopId)) {
      conditions.push(eq(products.shopId, queryShopId));
    } else {
      conditions.push(inArray(products.shopId, userShopIds));
    }

    if (search) {
      conditions.push(
        or(
          sql`COALESCE(${products.customName}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.barcode}, '') ILIKE ${`%${search}%`}`,
          sql`COALESCE(${products.sku}, '') ILIKE ${`%${search}%`}`
        )
      );
    }

    // categoryId is now 'mobile' or 'accessories' (hardcoded values)
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }

    if (lowStock === 'true') {
      conditions.push(lte(products.stock, products.lowStockThreshold));
    }

    const whereClause = and(...conditions);

    // Left join with mobileCatalog to get color and other catalog info
    const productList = await db.select({
      id: products.id,
      shopId: products.shopId,
      categoryId: products.categoryId,
      mobileCatalogId: products.mobileCatalogId,
      accessoryCatalogId: products.accessoryCatalogId,
      customName: products.customName,
      sku: products.sku,
      barcode: products.barcode,
      stock: products.stock,
      purchasePrice: products.purchasePrice,
      salePrice: products.salePrice,
      vendorId: products.vendorId,
      lowStockThreshold: products.lowStockThreshold,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      mobileCatalog: {
        id: mobileCatalog.id,
        brand: mobileCatalog.brand,
        name: mobileCatalog.name,
        memory: mobileCatalog.memory,
        color: mobileCatalog.color,
      }
    })
      .from(products)
      .leftJoin(mobileCatalog, eq(products.mobileCatalogId, mobileCatalog.id))
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
    const userShopIds = req.userShopIds || [];

    const [product] = await db.select().from(products).where(
      and(eq(products.id, id), inArray(products.shopId, userShopIds))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    let vendor = null;
    if (product.vendorId) {
      const [v] = await db.select().from(vendors).where(eq(vendors.id, product.vendorId)).limit(1);
      vendor = v;
    }

    let catalogItem = null;
    if (product.categoryId === 'mobile' && product.mobileCatalogId) {
      const [m] = await db.select().from(mobileCatalog).where(eq(mobileCatalog.id, product.mobileCatalogId)).limit(1);
      catalogItem = m;
    } else if (product.categoryId === 'accessories' && product.accessoryCatalogId) {
      const [a] = await db.select().from(accessoryCatalog).where(eq(accessoryCatalog.id, product.accessoryCatalogId)).limit(1);
      catalogItem = a;
    }

    res.json({ product, vendor, catalogItem });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const userShopIds = req.userShopIds || [];

    const [product] = await db.select().from(products).where(
      and(eq(products.barcode, barcode), inArray(products.shopId, userShopIds))
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
    const userShopIds = req.userShopIds || [];

    // Search for phone unit by IMEI (primary or secondary)
    const [phoneUnit] = await db.select().from(phoneUnits).where(
      and(
        or(eq(phoneUnits.imeiPrimary, imei), eq(phoneUnits.imeiSecondary, imei)),
        inArray(phoneUnits.shopId, userShopIds)
      )
    ).limit(1);

    if (!phoneUnit) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    // Get the associated product
    const [product] = await db.select().from(products).where(
      eq(products.id, phoneUnit.productId)
    ).limit(1);

    res.json({ product, phoneUnit });
  } catch (error) {
    console.error('Get product by IMEI error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

const checkImeiUniqueness = async (imei, shopId, excludePhoneUnitId = null) => {
  if (!imei) return true;
  
  let conditions = [
    or(eq(phoneUnits.imeiPrimary, imei), eq(phoneUnits.imeiSecondary, imei))
  ];
  
  if (excludePhoneUnitId) {
    conditions.push(ne(phoneUnits.id, excludePhoneUnitId));
  }
  
  const [existing] = await db.select().from(phoneUnits).where(and(...conditions)).limit(1);
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
      categoryId, 
      mobileCatalogId, 
      accessoryCatalogId,
      customName,
      sku,
      imeiPrimary, 
      imeiSecondary,
      barcode,
      stock,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold,
      shopId: requestedShopId,
      colorId,
      storageId,
      condition
    } = req.validatedBody;

    // Use shopId from request body if provided, otherwise fall back to user's first shop
    const shopId = requestedShopId || req.userShopIds?.[0];

    // Debug logging
    console.log('Create product - User:', req.user?.username, 'Role:', req.user?.role);
    console.log('Create product - Requested shopId:', requestedShopId);
    console.log('Create product - User shopIds:', req.userShopIds);
    console.log('Create product - Final shopId:', shopId);

    if (!shopId) {
      return res.status(400).json({ error: req.t ? req.t('product.shop_required') : 'Shop ID is required' });
    }

    // Super admins and admins have access to all shops
    // Regular users (sales_person, etc.) need to be assigned to the shop
    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && req.userShopIds?.length > 0 && !req.userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t ? req.t('product.shop_access_denied') : 'You do not have access to this shop' });
    }

    if (vendorId) {
      const [vendorExists] = await db.select().from(vendors).where(
        and(eq(vendors.id, vendorId), eq(vendors.shopId, shopId))
      ).limit(1);
      if (!vendorExists) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    }

    if (!(await checkBarcodeUniqueness(barcode, shopId))) {
      return res.status(409).json({ error: req.t ? req.t('product.barcode_exists') : 'Barcode already exists' });
    }

    // For mobile phones, check IMEI uniqueness
    if (categoryId === 'mobile' && imeiPrimary) {
      if (!(await checkImeiUniqueness(imeiPrimary, shopId))) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : 'IMEI already exists' });
      }

      if (imeiSecondary && !(await checkImeiUniqueness(imeiSecondary, shopId))) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : 'IMEI already exists' });
      }

      if (imeiPrimary && imeiSecondary && imeiPrimary === imeiSecondary) {
        return res.status(400).json({ error: req.t ? req.t('product.imei_duplicate') : 'Primary and Secondary IMEI cannot be the same' });
      }
    }

    if (mobileCatalogId) {
      const [catalogExists] = await db.select().from(mobileCatalog).where(
        eq(mobileCatalog.id, mobileCatalogId)
      ).limit(1);
      if (!catalogExists) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_mobile_catalog') : 'Invalid mobile catalog item' });
      }
    }

    if (accessoryCatalogId) {
      const [catalogExists] = await db.select().from(accessoryCatalog).where(
        eq(accessoryCatalog.id, accessoryCatalogId)
      ).limit(1);
      if (!catalogExists) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_accessory_catalog') : 'Invalid accessory catalog item' });
      }
    }

    // Auto-generate barcode if not provided
    const finalBarcode = barcode || `MB-${shopId.substring(0, 6)}-${Date.now()}`;
    
    // Auto-generate SKU based on model if not provided
    let finalSku = sku;
    if (!finalSku && categoryId === 'mobile' && mobileCatalogId) {
      const [catalogItem] = await db.select().from(mobileCatalog).where(eq(mobileCatalog.id, mobileCatalogId)).limit(1);
      if (catalogItem && catalogItem.brand && catalogItem.name) {
        const brandCode = catalogItem.brand.substring(0, 3).toUpperCase();
        const modelCode = catalogItem.name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
        const memoryCode = catalogItem.memory ? `-${catalogItem.memory.replace(/\s+/g, '')}` : '';
        const colorCode = catalogItem.color ? `-${catalogItem.color.substring(0, 3).toUpperCase()}` : '';
        finalSku = `${brandCode}-${modelCode}${memoryCode}${colorCode}`;
      }
    }

    // For accessories, use stock count directly
    // For mobiles, stock is calculated from phone units
    const [newProduct] = await db.insert(products).values({
      shopId,
      categoryId,
      mobileCatalogId: categoryId === 'mobile' ? (mobileCatalogId || null) : null,
      accessoryCatalogId: categoryId === 'accessories' ? (accessoryCatalogId || null) : null,
      customName: customName || null,
      sku: finalSku || null,
      barcode: finalBarcode,
      stock: categoryId === 'accessories' ? (stock || 1) : 0, // For mobiles, stock is 0 (calculated from phoneUnits)
      purchasePrice: purchasePrice?.toString() || null,
      salePrice: salePrice.toString(),
      vendorId: vendorId || null,
      lowStockThreshold: lowStockThreshold || 5
    }).returning();

    let newPhoneUnit = null;
    // For mobile phones with IMEI, create a phone unit
    if (categoryId === 'mobile' && imeiPrimary) {
      [newPhoneUnit] = await db.insert(phoneUnits).values({
        shopId,
        productId: newProduct.id,
        imeiPrimary,
        imeiSecondary: imeiSecondary || null,
        condition: condition || 'new',
        status: 'in_stock',
        purchasePrice: purchasePrice?.toString() || null,
        colorId: colorId || null,
        storageId: storageId || null,
        vendorId: vendorId || null
      }).returning();
    }

    try {
      await logActivity(req.user?.id, 'create', 'product', newProduct.id, {
        categoryId,
        customName: newProduct.customName,
        barcode: newProduct.barcode,
        salePrice: newProduct.salePrice,
        imeiPrimary: newPhoneUnit?.imeiPrimary,
        imeiSecondary: newPhoneUnit?.imeiSecondary
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(201).json({ product: newProduct, phoneUnit: newPhoneUnit });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: req.t ? req.t('product.create_failed') : 'Failed to create product' });
  }
};

export const bulkCreateProducts = async (req, res) => {
  try {
    const { 
      shopId: requestedShopId,
      categoryId, 
      mobileCatalogId, 
      customName,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold,
      quantity,
      imeis,
      condition,
      colorId,
      storageId
    } = req.validatedBody;

    const shopId = requestedShopId || req.userShopIds?.[0];

    if (!shopId) {
      return res.status(400).json({ error: req.t ? req.t('product.shop_required') : 'Shop ID is required' });
    }

    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && req.userShopIds?.length > 0 && !req.userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t ? req.t('product.shop_access_denied') : 'You do not have access to this shop' });
    }

    if (quantity !== imeis.length) {
      return res.status(400).json({ error: req.t ? req.t('product.imei_count_mismatch') : 'IMEI count must match quantity' });
    }

    // Collect all IMEIs for uniqueness check
    const allImeis = [];
    for (const imeiPair of imeis) {
      allImeis.push(imeiPair.imeiPrimary || imeiPair.imei1);
      const secondary = imeiPair.imeiSecondary || imeiPair.imei2;
      if (secondary) {
        allImeis.push(secondary);
      }
    }

    const uniqueImeis = new Set(allImeis);
    if (uniqueImeis.size !== allImeis.length) {
      return res.status(400).json({ error: req.t ? req.t('product.duplicate_imei_in_batch') : 'Duplicate IMEIs found in batch' });
    }

    // Check for existing IMEIs in phoneUnits table
    for (const imei of allImeis) {
      const [existingInPhoneUnits] = await db.select().from(phoneUnits).where(
        or(eq(phoneUnits.imeiPrimary, imei), eq(phoneUnits.imeiSecondary, imei))
      ).limit(1);
      
      if (existingInPhoneUnits) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : `IMEI ${imei} already exists` });
      }
    }

    if (mobileCatalogId) {
      const [catalogExists] = await db.select().from(mobileCatalog).where(
        eq(mobileCatalog.id, mobileCatalogId)
      ).limit(1);
      if (!catalogExists) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_mobile_catalog') : 'Invalid mobile catalog item' });
      }
    }

    // Find or create a single product SKU for this model
    let product = null;
    const [existingProduct] = await db.select().from(products).where(
      and(
        eq(products.shopId, shopId),
        eq(products.categoryId, categoryId),
        mobileCatalogId ? eq(products.mobileCatalogId, mobileCatalogId) : sql`true`
      )
    ).limit(1);

    if (existingProduct) {
      product = existingProduct;
    } else {
      // Create new product SKU
      const finalBarcode = `MB-${shopId.substring(0, 6)}-${Date.now()}`;
      
      let finalSku = null;
      if (categoryId === 'mobile' && mobileCatalogId) {
        const [catalogItem] = await db.select().from(mobileCatalog).where(eq(mobileCatalog.id, mobileCatalogId)).limit(1);
        if (catalogItem && catalogItem.brand && catalogItem.name) {
          const brandCode = catalogItem.brand.substring(0, 3).toUpperCase();
          const modelCode = catalogItem.name.replace(/\s+/g, '').substring(0, 6).toUpperCase();
          const memoryCode = catalogItem.memory ? `-${catalogItem.memory.replace(/\s+/g, '')}` : '';
          const colorCode = catalogItem.color ? `-${catalogItem.color.substring(0, 3).toUpperCase()}` : '';
          finalSku = `${brandCode}-${modelCode}${memoryCode}${colorCode}`;
        }
      }

      const [newProduct] = await db.insert(products).values({
        shopId,
        categoryId,
        mobileCatalogId: categoryId === 'mobile' ? (mobileCatalogId || null) : null,
        customName: customName || null,
        sku: finalSku,
        barcode: finalBarcode,
        stock: 0, // Stock calculated from phoneUnits
        purchasePrice: purchasePrice?.toString() || null,
        salePrice: salePrice.toString(),
        vendorId: vendorId || null,
        lowStockThreshold: lowStockThreshold || 5
      }).returning();

      product = newProduct;
    }

    // Create phone units for each IMEI pair
    const createdPhoneUnits = [];

    for (let i = 0; i < quantity; i++) {
      const imeiPair = imeis[i];
      const primaryImei = imeiPair.imeiPrimary || imeiPair.imei1;
      const secondaryImei = imeiPair.imeiSecondary || imeiPair.imei2;

      const [newPhoneUnit] = await db.insert(phoneUnits).values({
        shopId,
        productId: product.id,
        imeiPrimary: primaryImei,
        imeiSecondary: secondaryImei || null,
        condition: condition || 'new',
        status: 'in_stock',
        purchasePrice: purchasePrice?.toString() || null,
        colorId: colorId || null,
        storageId: storageId || null,
        vendorId: vendorId || null
      }).returning();

      createdPhoneUnits.push(newPhoneUnit);
    }

    try {
      await logActivity(req.user?.id, 'bulk_create', 'product', product.id, {
        categoryId,
        customName,
        quantity,
        productId: product.id,
        phoneUnitCount: createdPhoneUnits.length
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(201).json({ 
      product,
      phoneUnits: createdPhoneUnits,
      message: req.t ? req.t('product.bulk_created', { count: quantity }) : `${quantity} phone units created successfully`
    });
  } catch (error) {
    console.error('Bulk create products error:', error);
    res.status(500).json({ error: req.t ? req.t('product.bulk_create_failed') : 'Failed to create products' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      customName,
      sku,
      barcode,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold
    } = req.validatedBody;

    const shopId = req.userShopIds?.[0];

    if (!shopId) {
      return res.status(400).json({ error: req.t('product.shop_required') || 'Shop ID is required' });
    }

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

    const finalCustomName = customName !== undefined ? customName : existingProduct.customName;
    const finalMobileCatalogId = existingProduct.mobileCatalogId;
    const finalAccessoryCatalogId = existingProduct.accessoryCatalogId;
    
    if (existingProduct.categoryId === 'mobile' && !finalCustomName && !finalMobileCatalogId) {
      return res.status(400).json({ error: req.t('product.name_or_catalog_required') });
    }
    if (existingProduct.categoryId === 'accessories' && !finalCustomName && !finalAccessoryCatalogId) {
      return res.status(400).json({ error: req.t('product.name_or_catalog_required') });
    }

    if (barcode !== undefined && barcode !== null) {
      if (!(await checkBarcodeUniqueness(barcode, shopId, id))) {
        return res.status(409).json({ error: req.t('product.barcode_exists') });
      }
    }

    const updateData = { updatedAt: new Date() };
    if (customName !== undefined) updateData.customName = customName;
    if (sku !== undefined) updateData.sku = sku;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice != null ? purchasePrice.toString() : null;
    if (salePrice !== undefined && salePrice != null) updateData.salePrice = salePrice.toString();
    if (vendorId !== undefined) updateData.vendorId = vendorId;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

    const [updatedProduct] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    try {
      await logActivity(req.user?.id, 'update', 'product', id, {
        changes: updateData,
        previousName: existingProduct.customName,
        newName: updatedProduct.customName
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

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

    try {
      await logActivity(req.user?.id, 'stock_update', 'product', id, {
        type,
        previousStock: existingProduct.stock,
        newStock,
        quantityChanged: quantity
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

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

    // For mobile products, also delete associated phone units
    if (existingProduct.categoryId === 'mobile') {
      await db.delete(phoneUnits).where(eq(phoneUnits.productId, id));
    }

    await db.delete(products).where(eq(products.id, id));

    try {
      await logActivity(req.user?.id, 'delete', 'product', id, {
        deletedProduct: {
          customName: existingProduct.customName,
          barcode: existingProduct.barcode,
          categoryId: existingProduct.categoryId
        }
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.json({ message: req.t('product.deleted') });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: req.t('product.delete_failed') });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const shopId = req.userShopIds?.[0];

    if (!shopId) {
      return res.status(400).json({ error: req.t('product.shop_required') || 'Shop ID is required' });
    }

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

export const getMobileCatalogModels = async (req, res) => {
  try {
    const { brand } = req.query;
    
    if (!brand) {
      return res.status(400).json({ error: req.t('product.brand_required') });
    }

    const models = await db.select({
      id: mobileCatalog.id,
      name: mobileCatalog.name,
      memory: mobileCatalog.memory,
      color: mobileCatalog.color
    })
      .from(mobileCatalog)
      .where(eq(mobileCatalog.brand, brand))
      .orderBy(mobileCatalog.name);

    const uniqueModels = [];
    const modelSet = new Set();

    for (const model of models) {
      const modelKey = `${model.name}-${model.memory || ''}`;
      if (!modelSet.has(modelKey)) {
        modelSet.add(modelKey);
        uniqueModels.push({
          id: model.id,
          name: model.name,
          memory: model.memory,
          displayName: model.memory ? `${model.name} ${model.memory}` : model.name
        });
      }
    }

    res.json({ models: uniqueModels });
  } catch (error) {
    console.error('Get mobile catalog models error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogColors = async (req, res) => {
  try {
    const { brand, model, memory } = req.query;
    
    if (!brand || !model) {
      return res.status(400).json({ error: req.t('product.brand_model_required') });
    }

    let conditions = [
      eq(mobileCatalog.brand, brand),
      eq(mobileCatalog.name, model)
    ];

    if (memory) {
      conditions.push(eq(mobileCatalog.memory, memory));
    }

    const colors = await db.selectDistinct({ 
      id: mobileCatalog.id,
      color: mobileCatalog.color 
    })
      .from(mobileCatalog)
      .where(and(...conditions))
      .orderBy(mobileCatalog.color);

    res.json({ colors: colors.filter(c => c.color).map(c => ({ id: c.id, color: c.color })) });
  } catch (error) {
    console.error('Get mobile catalog colors error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogItem = async (req, res) => {
  try {
    const { brand, model, memory, color } = req.query;
    
    if (!brand || !model) {
      return res.status(400).json({ error: req.t('product.brand_model_required') });
    }

    let conditions = [
      eq(mobileCatalog.brand, brand),
      eq(mobileCatalog.name, model)
    ];

    if (memory) {
      conditions.push(eq(mobileCatalog.memory, memory));
    }

    if (color) {
      conditions.push(eq(mobileCatalog.color, color));
    }

    const [catalogItem] = await db.select()
      .from(mobileCatalog)
      .where(and(...conditions))
      .limit(1);

    if (!catalogItem) {
      return res.status(404).json({ error: req.t('product.catalog_item_not_found') });
    }

    res.json({ catalogItem });
  } catch (error) {
    console.error('Get mobile catalog item error:', error);
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
  getAccessoryCatalogBrands,
  getMobileCatalogModels,
  getMobileCatalogColors,
  getMobileCatalogItem
};
