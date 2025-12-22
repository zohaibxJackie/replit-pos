import { db } from '../config/database.js';
import { stock, variant, product, brand, category, vendors, users, customers, taxes } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or, lte, ne, inArray } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';
import { logActivity } from './notificationController.js';
import { fetchMobileProducts, fetchAccessoryProducts } from '../helpers/productHelpers.js';
import dotenv from 'dotenv';
dotenv.config();

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, productCategory, lowStock, shopId: queryShopId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const userShopIds = req.userShopIds || [];

    if (userShopIds.length === 0) {
      return res.status(400).json({ error: req.t('product.shop_required') || 'Shop ID is required' });
    }

    if (!productCategory) {
      return res.status(400).json({ error: req.t('product.category_required') || 'Category is required' });
    }

    const validCategories = ['mobile', 'accessory'];
    if (!validCategories.includes(productCategory)) {
      return res.status(400).json({ error: req.t('product.invalid_category') || 'Invalid category. Must be mobile or accessory' });
    }

    const queryParams = {
      userShopIds,
      queryShopId,
      search,
      lowStock,
      offset,
      pageLimit
    };

    let result;
    if (productCategory === 'mobile') {
      result = await fetchMobileProducts(queryParams);
    } else {
      result = await fetchAccessoryProducts(queryParams);
    }

    res.status(200).json({
      products: result.products,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: result.total,
        totalPages: Math.ceil(result.total / pageLimit)
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

    const [stockItem] = await db.select({
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
      lowStockThreshold: stock.lowStockThreshold,
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
        id: category.id,
        name: category.name,
      }
    })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(eq(stock.id, id), inArray(stock.shopId, userShopIds)))
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    let vendor = null;
    if (stockItem.vendorId) {
      const [v] = await db.select().from(vendors).where(eq(vendors.id, stockItem.vendorId)).limit(1);
      vendor = v;
    }

    res.json({ product: stockItem, vendor });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db.select({
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
        id: category.id,
        name: category.name,
      }
    })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(eq(stock.barcode, barcode), inArray(stock.shopId, userShopIds), eq(stock.isActive, true)))
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    res.json({ product: stockItem });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getProductByImei = async (req, res) => {
  try {
    const { imei } = req.params;
    const userShopIds = req.userShopIds || [];

    const [stockItem] = await db.select({
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
        id: category.id,
        name: category.name,
      }
    })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(
        and(
          or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
          inArray(stock.shopId, userShopIds),
          eq(stock.isActive, true)
        )
      )
      .limit(1);

    if (!stockItem) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    res.json({ product: stockItem });
  } catch (error) {
    console.error('Get product by IMEI error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

const checkImeiUniqueness = async (imei, excludeStockId = null) => {
  if (!imei) return true;
  
  let conditions = [
    or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
    eq(stock.isActive, true)
  ];
  
  if (excludeStockId) {
    conditions.push(ne(stock.id, excludeStockId));
  }
  
  const [existing] = await db.select().from(stock).where(and(...conditions)).limit(1);
  return !existing;
};

const checkBarcodeUniqueness = async (barcode, shopId, excludeStockId = null) => {
  if (!barcode) return true;
  
  let conditions = [
    eq(stock.shopId, shopId),
    eq(stock.barcode, barcode),
    eq(stock.isActive, true)
  ];
  
  if (excludeStockId) {
    conditions.push(ne(stock.id, excludeStockId));
  }
  
  const [existing] = await db.select().from(stock).where(and(...conditions)).limit(1);
  return !existing;
};

export const createProduct = async (req, res) => {
  try {
    const { 
      variantId,
      primaryImei,
      secondaryImei,
      serialNumber,
      barcode,
      purchasePrice,
      salePrice,
      vendorId,
      shopId: requestedShopId,
      condition,
      notes,
      vendorType,
      taxId,
      lowStockThreshold
    } = req.validatedBody;

    const shopId = requestedShopId || req.userShopIds?.[0];

    // console.log('Create product - User:', req.user?.username, 'Role:', req.user?.role);
    // console.log('Create product - Requested shopId:', requestedShopId);
    // console.log('Create product - User shopIds:', req.userShopIds);
    // console.log('Create product - Final shopId:', shopId);

    if (!shopId) {
      return res.status(400).json({ error: req.t ? req.t('product.shop_required') : 'Shop ID is required' });
    }

    if (!variantId) {
      return res.status(400).json({ error: req.t ? req.t('product.variant_required') : 'Variant ID is required' });
    }

    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && req.userShopIds?.length > 0 && !req.userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t ? req.t('product.shop_access_denied') : 'You do not have access to this shop' });
    }

    const [variantExists] = await db.select().from(variant).where(eq(variant.id, variantId)).limit(1);
    if (!variantExists) {
      return res.status(400).json({ error: req.t ? req.t('product.invalid_variant') : 'Invalid variant' });
    }
    
    const [serialExists] = await db.select().from(stock).where(eq(stock.serialNumber, serialNumber)).limit(1);
    
    if (serialExists) {
      return res.status(400).json({ error: req.t ? req.t('product.invalid_serial') : 'Serial number already exists' });
    }

    if (!vendorType) {
      return res.status(400).json({ error: req.t ? req.t('product.vendor_type') : 'Vendor type is required' }); 
    } else if (vendorType === process.env.WHOLESALER) {
      const wholesaler = await db.select().from(users).where(
        and(eq(users.role, vendorType), eq(users.id, vendorId))
      ).limit(1);
      if (!wholesaler) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else if (vendorType === process.env.CUSTOMER) {
      const customer = await db.select().from(customers).where(
        eq(customers.id, vendorId)
      ).limit(1);
      if (!customer) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else if (vendorType === process.env.VENDOR) {
      const vendor = await db.select().from(vendors).where(
        eq(vendors.id, vendorId)
      )
      if (!vendor) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else {
      return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
    }

    if (!(await checkBarcodeUniqueness(barcode, shopId))) {
      return res.status(409).json({ error: req.t ? req.t('product.barcode_exists') : 'Barcode already exists' });
    }

    if (primaryImei) {
      if (!(await checkImeiUniqueness(primaryImei))) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : 'IMEI already exists' });
      }

      if (secondaryImei && !(await checkImeiUniqueness(secondaryImei))) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : 'IMEI already exists' });
      }

      if (primaryImei && secondaryImei && primaryImei === secondaryImei) {
        return res.status(400).json({ error: req.t ? req.t('product.imei_duplicate') : 'Primary and Secondary IMEI cannot be the same' });
      }
    }
    
    if (taxId) {
      const [tax] = await db.select().from(taxes).where(eq(taxes.id, taxId));
      if (!tax) {
        return res.status(400).json({ error: req.t ? req.t('product.tax_invalid') : 'Invalid tax id' });
      }
    }

    const finalBarcode = barcode || `STK-${shopId.substring(0, 6)}-${Date.now()}`;

    const [newStock] = await db.insert(stock).values({
      shopId,
      variantId,
      primaryImei: primaryImei || null,
      secondaryImei: secondaryImei || null,
      serialNumber: serialNumber || null,
      barcode: finalBarcode,
      purchasePrice: purchasePrice?.toString() || null,
      salePrice: salePrice?.toString() || null,
      condition: condition || 'new',
      stockStatus: 'in_stock',
      isSold: false,
      notes: notes || null,
      vendorId: vendorId,
      vendorType,
      taxId,
      lowStockThreshold
    }).returning();

    try {
      await logActivity(req.user?.id, 'create', 'stock', newStock.id, {
        variantId,
        barcode: newStock.barcode,
        salePrice: newStock.salePrice,
        primaryImei: newStock.primaryImei,
        secondaryImei: newStock.secondaryImei
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(201).json({ product: newStock });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: req.t ? req.t('product.create_failed') : 'Failed to create product' });
  }
};

export const bulkCreateProducts = async (req, res) => {
  try {
    const { 
      shopId: requestedShopId,
      variantId,
      purchasePrice,
      salePrice,
      vendorId,
      lowStockThreshold,
      quantity,
      imeis,
      condition,
      notes,
      vendorType
    } = req.validatedBody;

    const shopId = requestedShopId || req.userShopIds?.[0];

    if (!shopId) {
      return res.status(400).json({ error: req.t ? req.t('product.shop_required') : 'Shop ID is required' });
    }

    if (!variantId) {
      return res.status(400).json({ error: req.t ? req.t('product.variant_required') : 'Variant ID is required' });
    }

    const hasFullAccess = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!hasFullAccess && req.userShopIds?.length > 0 && !req.userShopIds.includes(shopId)) {
      return res.status(403).json({ error: req.t ? req.t('product.shop_access_denied') : 'You do not have access to this shop' });
    }

    if (quantity !== imeis.length) {
      return res.status(400).json({ error: req.t ? req.t('product.imei_count_mismatch') : 'IMEI count must match quantity' });
    }

    if (!vendorType) {
      return res.status(400).json({ error: req.t ? req.t('product.vendor_type') : 'Vendor type is required' }); 
    } else if (vendorType === process.env.WHOLESALER) {
      const wholesaler = await db.select().from(users).where(
        and(eq(users.role, vendorType), eq(users.id, vendorId))
      ).limit(1);
      if (!wholesaler) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else if (vendorType === process.env.CUSTOMER) {
      const customer = await db.select().from(customers).where(
        eq(customers.id, vendorId)
      ).limit(1);
      if (!customer) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else if (vendorType === process.env.VENDOR) {
      const vendor = await db.select().from(vendors).where(
        eq(vendors.id, vendorId)
      )
      if (!vendor) {
        return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
      }
    } else {
      return res.status(400).json({ error: req.t ? req.t('product.invalid_vendor') : 'Invalid vendor' });
    }

    const [variantExists] = await db.select().from(variant).where(eq(variant.id, variantId)).limit(1);
    if (!variantExists) {
      return res.status(400).json({ error: req.t ? req.t('product.invalid_variant') : 'Invalid variant' });
    }

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

    for (const imei of allImeis) {
      const [existingStock] = await db.select().from(stock).where(
        and(
          or(eq(stock.primaryImei, imei), eq(stock.secondaryImei, imei)),
          eq(stock.isActive, true)
        )
      ).limit(1);
      
      if (existingStock) {
        return res.status(409).json({ error: req.t ? req.t('product.imei_exists') : `IMEI ${imei} already exists` });
      }
    }

    const createdStockItems = [];

    for (let i = 0; i < quantity; i++) {
      const imeiPair = imeis[i];
      const primaryImei = imeiPair.imeiPrimary || imeiPair.imei1;
      const secondaryImei = imeiPair.imeiSecondary || imeiPair.imei2;
      const finalBarcode = `STK-${shopId.substring(0, 6)}-${Date.now()}-${i}`;

      const [newStock] = await db.insert(stock).values({
        shopId,
        variantId,
        primaryImei,
        secondaryImei: secondaryImei || null,
        barcode: finalBarcode,
        purchasePrice: purchasePrice?.toString() || null,
        salePrice: salePrice?.toString() || null,
        condition: condition || 'new',
        stockStatus: 'in_stock',
        isSold: false,
        notes: notes || null,
        lowStockThreshold: lowStockThreshold || 5,
        vendorId: vendorId || null,
        vendorType
      }).returning();

      createdStockItems.push(newStock);
    }

    try {
      await logActivity(req.user?.id, 'bulk_create', 'stock', createdStockItems[0]?.id, {
        variantId,
        quantity,
        stockCount: createdStockItems.length
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(201).json({ 
      products: createdStockItems,
      message: req.t ? req.t('product.bulk_created', { count: quantity }) : `${quantity} stock items created successfully`
    });
  } catch (error) {
    console.error('Bulk create products error:', error);
    res.status(500).json({ error: req.t ? req.t('product.bulk_create_failed') : 'Failed to create products' });
  }
};

// export const updateProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { 
//       barcode,
//       purchasePrice,
//       salePrice,
//       vendorId,
//       lowStockThreshold,
//       notes,
//       condition
//     } = req.validatedBody;

//     const userShopIds = req.userShopIds || [];

//     const [existingStock] = await db.select().from(stock).where(
//       and(eq(stock.id, id), inArray(stock.shopId, userShopIds))
//     ).limit(1);

//     if (!existingStock) {
//       return res.status(404).json({ error: req.t('product.not_found') });
//     }

//     if (vendorId !== undefined && vendorId !== null) {
//       const [vendorExists] = await db.select().from(vendors).where(
//         and(eq(vendors.id, vendorId), eq(vendors.shopId, existingStock.shopId))
//       ).limit(1);
//       if (!vendorExists) {
//         return res.status(400).json({ error: req.t('product.invalid_vendor') });
//       }
//     }

//     if (barcode !== undefined && barcode !== null) {
//       if (!(await checkBarcodeUniqueness(barcode, existingStock.shopId, id))) {
//         return res.status(409).json({ error: req.t('product.barcode_exists') });
//       }
//     }

//     const updateData = { updatedAt: new Date() };
//     if (barcode !== undefined) updateData.barcode = barcode;
//     if (purchasePrice !== undefined) updateData.purchasePrice = purchasePrice != null ? purchasePrice.toString() : null;
//     if (salePrice !== undefined && salePrice != null) updateData.salePrice = salePrice.toString();
//     if (vendorId !== undefined) updateData.vendorId = vendorId;
//     if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;
//     if (notes !== undefined) updateData.notes = notes;
//     if (condition !== undefined) updateData.condition = condition;

//     const [updatedStock] = await db.update(stock)
//       .set(updateData)
//       .where(eq(stock.id, id))
//       .returning();

//     try {
//       await logActivity(req.user?.id, 'update', 'stock', id, {
//         changes: updateData
//       }, req);
//     } catch (logError) {
//       console.error('Activity logging failed:', logError);
//     }

//     res.json({ product: updatedStock });
//   } catch (error) {
//     console.error('Update product error:', error);
//     res.status(500).json({ error: req.t('product.update_failed') });
//   }
// };

export const updateProduct = async (req, res) => {
  try {
    const stockId = req.params.id;
    const {
      variantId,
      primaryImei,
      secondaryImei,
      serialNumber,
      barcode,
      purchasePrice,
      salePrice,
      notes,
      taxId,
      lowStockThreshold
    } = req.validatedBody;

    if (!stockId) {
      return res.status(400).json({ error: 'Stock ID is required' });
    }

    const [existingStock] = await db
      .select()
      .from(stock)
      .where(eq(stock.id, stockId))
      .limit(1);

    if (!existingStock) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    if (variantId && variantId !== existingStock.variantId) {
      const [variantExists] = await db
        .select()
        .from(variant)
        .where(eq(variant.id, variantId))
        .limit(1);

      if (!variantExists) {
        return res.status(400).json({ error: 'Invalid variant' });
      }
    }

    if (serialNumber && serialNumber !== existingStock.serialNumber) {
      const [serialExists] = await db
        .select()
        .from(stock)
        .where(eq(stock.serialNumber, serialNumber))
        .limit(1);

      if (serialExists) {
        return res.status(409).json({ error: 'Serial number already exists' });
      }
    }

    if (barcode && barcode !== existingStock.barcode) {
      if (!(await checkBarcodeUniqueness(barcode, existingStock.shopId))) {
        return res.status(409).json({ error: 'Barcode already exists' });
      }
    }

    if (primaryImei && primaryImei !== existingStock.primaryImei) {
      if (!(await checkImeiUniqueness(primaryImei))) {
        return res.status(409).json({ error: 'IMEI already exists' });
      }
    }

    if (secondaryImei && secondaryImei !== existingStock.secondaryImei) {
      if (!(await checkImeiUniqueness(secondaryImei))) {
        return res.status(409).json({ error: 'IMEI already exists' });
      }
    }

    if (primaryImei && secondaryImei && primaryImei === secondaryImei) {
      return res
        .status(400)
        .json({ error: 'Primary and Secondary IMEI cannot be same' });
    }

    if (taxId) {
      const [tax] = await db.select().from(taxes).where(eq(taxes.id, taxId));
      if (!tax) {
        return res.status(400).json({ error: 'Invalid tax id' });
      }
    }
    const updateData = { updatedAt: new Date() };

    if (variantId !== undefined) updateData.variantId = variantId;
    if (primaryImei !== undefined)
      updateData.primaryImei = primaryImei || null;
    if (secondaryImei !== undefined)
      updateData.secondaryImei = secondaryImei || null;
    if (serialNumber !== undefined)
      updateData.serialNumber = serialNumber || null;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (purchasePrice !== undefined)
      updateData.purchasePrice =
        purchasePrice != null ? purchasePrice.toString() : null;
    if (salePrice !== undefined)
      updateData.salePrice =
        salePrice != null ? salePrice.toString() : null;
    if (notes !== undefined) updateData.notes = notes;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (lowStockThreshold !== undefined)
      updateData.lowStockThreshold = lowStockThreshold;

    //  Update stock
    const [updatedStock] = await db
      .update(stock)
      .set(updateData)
      .where(eq(stock.id, stockId))
      .returning();

    // Activity log
    try {
      await logActivity(
        req.user?.id,
        'update',
        'stock',
        stockId,
        {
          before: {
            barcode: existingStock.barcode,
            salePrice: existingStock.salePrice,
            primaryImei: existingStock.primaryImei,
            secondaryImei: existingStock.secondaryImei
          },
          after: {
            barcode: updatedStock.barcode,
            salePrice: updatedStock.salePrice,
            primaryImei: updatedStock.primaryImei,
            secondaryImei: updatedStock.secondaryImei
          }
        },
        req
      );
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.status(200).json({ product: updatedStock });
  } catch (error) {
    res.status(500).json({ error: req.t('product.update_failed') });
  }
};



export const updateStockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockStatus } = req.validatedBody;
    const userShopIds = req.userShopIds || [];

    const [existingStock] = await db.select().from(stock).where(
      and(eq(stock.id, id), inArray(stock.shopId, userShopIds))
    ).limit(1);

    if (!existingStock) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    const [updatedStock] = await db.update(stock)
      .set({ stockStatus, updatedAt: new Date() })
      .where(eq(stock.id, id))
      .returning();

    try {
      await logActivity(req.user?.id, 'status_update', 'stock', id, {
        previousStatus: existingStock.stockStatus,
        newStatus: stockStatus
      }, req);
    } catch (logError) {
      console.error('Activity logging failed:', logError);
    }

    res.json({ product: updatedStock });
  } catch (error) {
    console.error('Update stock status error:', error);
    res.status(500).json({ error: req.t('product.stock_update_failed') });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userShopIds = req.userShopIds || [];

    const [existingStock] = await db.select().from(stock).where(
      and(eq(stock.id, id), inArray(stock.shopId, userShopIds))
    ).limit(1);

    if (!existingStock) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    await db.update(stock)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(stock.id, id));

    try {
      await logActivity(req.user?.id, 'delete', 'stock', id, {
        deletedStock: {
          barcode: existingStock.barcode,
          primaryImei: existingStock.primaryImei
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

    const lowStockItems = await db.select({
      variantId: stock.variantId,
      count: sql`count(*)::int`,
      lowStockThreshold: sql`min(${stock.lowStockThreshold})::int`,
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
        id: category.id,
        name: category.name,
      }
    })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(
        and(
          eq(stock.shopId, shopId),
          eq(stock.isActive, true),
          eq(stock.isSold, false),
          eq(stock.stockStatus, 'in_stock')
        )
      )
      .groupBy(stock.variantId, variant.id, variant.variantName, variant.color, variant.storageSize, product.id, product.name, brand.id, brand.name, category.id, category.name)
      .having(sql`count(*) <= min(${stock.lowStockThreshold})`);

    res.json({ products: lowStockItems });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: req.t('product.low_stock_fetch_failed') });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await db.select()
      .from(category)
      .where(eq(category.isActive, true))
      .orderBy(category.name);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: req.t('product.categories_fetch_failed') });
  }
};

export const getBrands = async (req, res) => {
  try {
    const { categoryId } = req.query;
    
    let query = db.select({
      id: brand.id,
      name: brand.name,
    })
      .from(brand)
      .where(eq(brand.isActive, true))
      .orderBy(brand.name);

    if (categoryId) {
      query = db.selectDistinct({
        id: brand.id,
        name: brand.name,
      })
        .from(brand)
        .innerJoin(product, eq(brand.id, product.brandId))
        .where(and(eq(brand.isActive, true), eq(product.categoryId, categoryId)))
        .orderBy(brand.name);
    }

    const brands = await query;

    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: req.t('product.brands_fetch_failed') });
  }
};

export const getProducts_Global = async (req, res) => {
  try {
    const { brandId, categoryId, search } = req.query;
    
    let conditions = [eq(product.isActive, true)];
    
    if (brandId) {
      conditions.push(eq(product.brandId, brandId));
    }
    
    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }
    
    if (search) {
      conditions.push(ilike(product.name, `%${search}%`));
    }

    const products = await db.select({
      id: product.id,
      name: product.name,
      brand: {
        id: brand.id,
        name: brand.name,
      },
      category: {
        id: category.id,
        name: category.name,
      }
    })
      .from(product)
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(...conditions))
      .orderBy(product.name);

    res.json({ products });
  } catch (error) {
    console.error('Get global products error:', error);
    res.status(500).json({ error: req.t('product.products_fetch_failed') });
  }
};

export const getVariants = async (req, res) => {
  try {
    const { productId, search } = req.query;
    
    let conditions = [eq(variant.isActive, true)];
    
    if (productId) {
      conditions.push(eq(variant.productId, productId));
    }
    
    if (search) {
      conditions.push(ilike(variant.variantName, `%${search}%`));
    }

    const variants = await db.select({
      id: variant.id,
      variantName: variant.variantName,
      color: variant.color,
      storageSize: variant.storageSize,
      sku: variant.sku,
      product: {
        id: product.id,
        name: product.name,
      },
      brand: {
        id: brand.id,
        name: brand.name,
      },
      category: {
        id: category.id,
        name: category.name,
      }
    })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(...conditions))
      .orderBy(variant.variantName);

    res.json({ variants });
  } catch (error) {
    console.error('Get variants error:', error);
    res.status(500).json({ error: req.t('product.variants_fetch_failed') });
  }
};

export const getMobileCatalog = async (req, res) => {
  try {
    const { search, brand: brandName } = req.query;
    
    let conditions = [eq(variant.isActive, true)];
    
    const [mobileCategory] = await db.select().from(category).where(ilike(category.name, 'mobile%')).limit(1);
    if (mobileCategory) {
      conditions.push(eq(product.categoryId, mobileCategory.id));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(variant.variantName, `%${search}%`),
          ilike(product.name, `%${search}%`),
          ilike(brand.name, `%${search}%`)
        )
      );
    }
    
    if (brandName) {
      conditions.push(eq(brand.name, brandName));
    }

    const catalog = await db.select({
      id: variant.id,
      name: product.name,
      brand: brand.name,
      memory: variant.storageSize,
      color: variant.color,
      variantName: variant.variantName,
    })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(...conditions))
      .orderBy(brand.name, product.name);

    res.json({ catalog });
  } catch (error) {
    console.error('Get mobile catalog error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getAccessoryCatalog = async (req, res) => {
  try {
    const { search, brand: brandName } = req.query;
    
    let conditions = [eq(variant.isActive, true)];
    
    const [accessoryCategory] = await db.select().from(category).where(ilike(category.name, 'accessor%')).limit(1);
    if (accessoryCategory) {
      conditions.push(eq(product.categoryId, accessoryCategory.id));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(variant.variantName, `%${search}%`),
          ilike(product.name, `%${search}%`),
          ilike(brand.name, `%${search}%`)
        )
      );
    }
    
    if (brandName) {
      conditions.push(eq(brand.name, brandName));
    }

    const catalog = await db.select({
      id: variant.id,
      name: product.name,
      brand: brand.name,
      variantName: variant.variantName,
    })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .leftJoin(category, eq(product.categoryId, category.id))
      .where(and(...conditions))
      .orderBy(brand.name, product.name);

    res.json({ catalog });
  } catch (error) {
    console.error('Get accessory catalog error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogBrands = async (req, res) => {
  try {
    const [mobileCategory] = await db.select().from(category).where(ilike(category.name, 'mobile%')).limit(1);
    
    let conditions = [eq(brand.isActive, true)];
    if (mobileCategory) {
      conditions.push(eq(product.categoryId, mobileCategory.id));
    }

    const brands = await db.selectDistinct({ brand: brand.name })
      .from(brand)
      .innerJoin(product, eq(brand.id, product.brandId))
      .where(and(...conditions))
      .orderBy(brand.name);

    res.json({ brands: brands.map(b => b.brand) });
  } catch (error) {
    console.error('Get mobile catalog brands error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getAccessoryCatalogBrands = async (req, res) => {
  try {
    const [accessoryCategory] = await db.select().from(category).where(ilike(category.name, 'accessor%')).limit(1);
    
    let conditions = [eq(brand.isActive, true)];
    if (accessoryCategory) {
      conditions.push(eq(product.categoryId, accessoryCategory.id));
    }

    const brands = await db.selectDistinct({ brand: brand.name })
      .from(brand)
      .innerJoin(product, eq(brand.id, product.brandId))
      .where(and(...conditions))
      .orderBy(brand.name);

    res.json({ brands: brands.map(b => b.brand) });
  } catch (error) {
    console.error('Get accessory catalog brands error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogModels = async (req, res) => {
  try {
    const { brand: brandName } = req.query;
    
    if (!brandName) {
      return res.status(400).json({ error: req.t('product.brand_required') });
    }

    // this query check if the mobile category exists or not
    const [mobileCategory] = await db.select().from(category).where(ilike(category.name, 'mobile%')).limit(1);

    let conditions = [eq(product.isActive, true), eq(brand.name, brandName)];
    if (mobileCategory) {
      conditions.push(eq(product.categoryId, mobileCategory.id));
    }

    const models = await db.select({
      id: variant.id,
      name: variant.variantName,
      productId: variant.productId
    })
    .from(product)
    .innerJoin(variant, eq(variant.productId, product.id))
    .where(eq(product.brandId, brandName))
    .orderBy(product.name);

    res.json({ models: models.map(m => ({ id: m.id, name: m.name, displayName: m.name, productId: m.productId})) });
  } catch (error) {
    console.error('Get mobile catalog models error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogColors = async (req, res) => {
  try {
    // model is product ic that is coming from frontend
    const { productId } = req.query;
    
    if (!productId) {
      return res.status(400).json(productId);
      // return res.status(400).json({ error: req.t('product.brand_model_required') });
    }

    let conditions = [
      eq(product.id, productId)
    ];

    const colors = await db.selectDistinct({ 
      id: variant.id,
      color: variant.color 
    })
      .from(variant)
      .where(eq(variant.productId, productId))

    res.json({ colors: colors.filter(c => c.color).map(c => ({ id: c.id, color: c.color })) });
  } catch (error) {
    console.error('Get mobile catalog colors error:', error);
    res.status(500).json({ error: req.t('product.catalog_fetch_failed') });
  }
};

export const getMobileCatalogItem = async (req, res) => {
  try {
    const { brand: brandName, model, memory, color } = req.query;
    
    if (!brandName || !model) {
      return res.status(400).json({ error: req.t('product.brand_model_required') });
    }

    let conditions = [
      eq(variant.isActive, true),
      eq(brand.name, brandName),
      eq(product.name, model)
    ];

    if (memory) {
      conditions.push(eq(variant.storageSize, memory));
    }

    if (color) {
      conditions.push(eq(variant.color, color));
    }

    const [catalogItem] = await db.select({
      id: variant.id,
      name: product.name,
      brand: brand.name,
      memory: variant.storageSize,
      color: variant.color,
      variantName: variant.variantName,
      sku: variant.sku,
    })
      .from(variant)
      .innerJoin(product, eq(variant.productId, product.id))
      .innerJoin(brand, eq(product.brandId, brand.id))
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
  bulkCreateProducts,
  updateProduct,
  updateStockStatus,
  deleteProduct,
  getLowStockProducts,
  getCategories,
  getBrands,
  getProducts_Global,
  getVariants,
  getMobileCatalog,
  getAccessoryCatalog,
  getMobileCatalogBrands,
  getAccessoryCatalogBrands,
  getMobileCatalogModels,
  getMobileCatalogColors,
  getMobileCatalogItem
};
