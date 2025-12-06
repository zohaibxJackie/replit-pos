import { db } from '../config/database.js';
import { vendors, stock, variant, product, brand } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.userShopIds?.[0];

    let conditions = [eq(vendors.shopId, shopId)];

    if (search) {
      conditions.push(
        or(
          ilike(vendors.name, `%${search}%`),
          ilike(vendors.email, `%${search}%`),
          ilike(vendors.phone, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    const vendorList = await db.select()
      .from(vendors)
      .where(whereClause)
      .orderBy(desc(vendors.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(vendors)
      .where(whereClause);

    res.json({
      vendors: vendorList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: req.t('vendor.fetch_failed') });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db.select().from(vendors).where(
      and(eq(vendors.id, id), eq(vendors.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!vendor) {
      return res.status(404).json({ error: req.t('vendor.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(stock)
      .where(and(eq(stock.vendorId, id), eq(stock.isActive, true)));

    res.json({ vendor, productCount });
  } catch (error) {
    console.error('Get vendor by id error:', error);
    res.status(500).json({ error: req.t('vendor.fetch_failed') });
  }
};

export const createVendor = async (req, res) => {
  try {
    const { name, phone, email, address } = req.validatedBody;

    const [newVendor] = await db.insert(vendors).values({
      shopId: req.userShopIds?.[0],
      name,
      phone: phone || null,
      email: email || null,
      address: address || null
    }).returning();

    res.status(201).json({ vendor: newVendor });
  } catch (error) {
    console.error('Create vendor error:', error);
    res.status(500).json({ error: req.t('vendor.create_failed') });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, address } = req.body;

    const [existingVendor] = await db.select().from(vendors).where(
      and(eq(vendors.id, id), eq(vendors.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingVendor) {
      return res.status(404).json({ error: req.t('vendor.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    const [updatedVendor] = await db.update(vendors)
      .set(updateData)
      .where(eq(vendors.id, id))
      .returning();

    res.json({ vendor: updatedVendor });
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ error: req.t('vendor.update_failed') });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingVendor] = await db.select().from(vendors).where(
      and(eq(vendors.id, id), eq(vendors.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingVendor) {
      return res.status(404).json({ error: req.t('vendor.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(stock)
      .where(and(eq(stock.vendorId, id), eq(stock.isActive, true)));

    if (productCount > 0) {
      return res.status(400).json({ error: req.t('vendor.has_products') });
    }

    await db.delete(vendors).where(eq(vendors.id, id));

    res.json({ message: req.t('vendor.deleted') });
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ error: req.t('vendor.delete_failed') });
  }
};

export const getVendorProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const [vendor] = await db.select().from(vendors).where(
      and(eq(vendors.id, id), eq(vendors.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!vendor) {
      return res.status(404).json({ error: req.t('vendor.not_found') });
    }

    const vendorProducts = await db.select({
      id: stock.id,
      barcode: stock.barcode,
      primaryImei: stock.primaryImei,
      secondaryImei: stock.secondaryImei,
      purchasePrice: stock.purchasePrice,
      salePrice: stock.salePrice,
      stockStatus: stock.stockStatus,
      condition: stock.condition,
      createdAt: stock.createdAt,
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
      }
    })
      .from(stock)
      .leftJoin(variant, eq(stock.variantId, variant.id))
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(and(eq(stock.vendorId, id), eq(stock.isActive, true)))
      .orderBy(desc(stock.createdAt));

    res.json({ vendor, products: vendorProducts });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ error: req.t('vendor.fetch_products_failed') });
  }
};

export default {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorProducts
};
