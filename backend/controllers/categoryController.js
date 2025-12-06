import { db } from '../config/database.js';
import { category, product } from '../../shared/schema.js';
import { eq, sql, ilike, and, desc } from 'drizzle-orm';
import { createCategorySchema, updateCategorySchema } from '../validators/inventory.js';

export const getCategories = async (req, res) => {
  try {
    const { search, isActive } = req.query;
    
    let conditions = [];
    
    if (search) {
      conditions.push(ilike(category.name, `%${search}%`));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(category.isActive, isActive === 'true'));
    }

    const categoryList = await db.select()
      .from(category)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(category.name);

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: req.t('category.fetch_failed') });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [cat] = await db.select().from(category).where(
      eq(category.id, id)
    ).limit(1);

    if (!cat) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(product)
      .where(eq(product.categoryId, id));

    res.json({
      category: cat,
      productCount
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: req.t('category.fetch_failed') });
  }
};

export const createCategory = async (req, res) => {
  try {
    const validation = createCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, isActive } = validation.data;

    const [newCategory] = await db.insert(category).values({
      name,
      isActive: isActive ?? true
    }).returning();

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: req.t('category.already_exists') });
    }
    res.status(500).json({ error: req.t('category.create_failed') });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = updateCategorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const [existingCategory] = await db.select().from(category).where(
      eq(category.id, id)
    ).limit(1);

    if (!existingCategory) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.isActive !== undefined) updateData.isActive = validation.data.isActive;

    const [updatedCategory] = await db.update(category)
      .set(updateData)
      .where(eq(category.id, id))
      .returning();

    res.json({ category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: req.t('category.already_exists') });
    }
    res.status(500).json({ error: req.t('category.update_failed') });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingCategory] = await db.select().from(category).where(
      eq(category.id, id)
    ).limit(1);

    if (!existingCategory) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(product)
      .where(eq(product.categoryId, id));

    if (productCount > 0) {
      return res.status(400).json({ error: req.t('category.has_products') });
    }

    await db.delete(category).where(eq(category.id, id));

    res.json({ message: req.t('category.deleted') });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: req.t('category.delete_failed') });
  }
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
