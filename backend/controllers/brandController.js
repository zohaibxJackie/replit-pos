import { db } from '../config/database.js';
import { brand, product } from '../../shared/schema.js';
import { eq, sql, ilike, and, desc } from 'drizzle-orm';
import { createBrandSchema, updateBrandSchema } from '../validators/inventory.js';

export const getBrands = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    
    let conditions = [];
    
    if (search) {
      conditions.push(ilike(brand.name, `%${search}%`));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(brand.isActive, isActive === 'true'));
    }

    const brandList = await db.select()
      .from(brand)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(brand.name);

    res.json({ brands: brandList });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ error: req.t('brand.fetch_failed') });
  }
};

export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const [br] = await db.select().from(brand).where(
      eq(brand.id, id)
    ).limit(1);

    if (!br) {
      return res.status(404).json({ error: req.t('brand.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(product)
      .where(eq(product.brandId, id));

    res.json({
      brand: br,
      productCount
    });
  } catch (error) {
    console.error('Get brand by id error:', error);
    res.status(500).json({ error: req.t('brand.fetch_failed') });
  }
};

export const createBrand = async (req, res) => {
  try {
    const validation = createBrandSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, isActive } = validation.data;

    const [newBrand] = await db.insert(brand).values({
      name,
      isActive: isActive ?? true
    }).returning();

    res.status(201).json({ brand: newBrand });
  } catch (error) {
    console.error('Create brand error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: req.t('brand.already_exists') });
    }
    res.status(500).json({ error: req.t('brand.create_failed') });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = updateBrandSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const [existingBrand] = await db.select().from(brand).where(
      eq(brand.id, id)
    ).limit(1);

    if (!existingBrand) {
      return res.status(404).json({ error: req.t('brand.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.isActive !== undefined) updateData.isActive = validation.data.isActive;

    const [updatedBrand] = await db.update(brand)
      .set(updateData)
      .where(eq(brand.id, id))
      .returning();

    res.json({ brand: updatedBrand });
  } catch (error) {
    console.error('Update brand error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: req.t('brand.already_exists') });
    }
    res.status(500).json({ error: req.t('brand.update_failed') });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingBrand] = await db.select().from(brand).where(
      eq(brand.id, id)
    ).limit(1);

    if (!existingBrand) {
      return res.status(404).json({ error: req.t('brand.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(product)
      .where(eq(product.brandId, id));

    if (productCount > 0) {
      return res.status(400).json({ error: req.t('brand.has_products') });
    }

    await db.delete(brand).where(eq(brand.id, id));

    res.json({ message: req.t('brand.deleted') });
  } catch (error) {
    console.error('Delete brand error:', error);
    res.status(500).json({ error: req.t('brand.delete_failed') });
  }
};

export default { getBrands, getBrandById, createBrand, updateBrand, deleteBrand };
