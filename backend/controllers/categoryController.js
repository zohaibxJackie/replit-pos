import { db } from '../config/database.js';
import { categories, products } from '../../shared/schema.js';
import { eq, sql } from 'drizzle-orm';

export const getCategories = async (req, res) => {
  try {
    const categoryList = await db.select()
      .from(categories)
      .orderBy(categories.name);

    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: req.t('category.fetch_failed') });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const [category] = await db.select().from(categories).where(
      eq(categories.id, id)
    ).limit(1);

    if (!category) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));

    res.json({
      category,
      productCount
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: req.t('category.fetch_failed') });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: req.t('category.name_required') });
    }

    const [newCategory] = await db.insert(categories).values({
      name
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
    const { name } = req.body;

    const [existingCategory] = await db.select().from(categories).where(
      eq(categories.id, id)
    ).limit(1);

    if (!existingCategory) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    if (!name) {
      return res.status(400).json({ error: req.t('category.name_required') });
    }

    const [updatedCategory] = await db.update(categories)
      .set({ name })
      .where(eq(categories.id, id))
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

    const [existingCategory] = await db.select().from(categories).where(
      eq(categories.id, id)
    ).limit(1);

    if (!existingCategory) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));

    if (productCount > 0) {
      return res.status(400).json({ error: req.t('category.has_products') });
    }

    await db.delete(categories).where(eq(categories.id, id));

    res.json({ message: req.t('category.deleted') });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: req.t('category.delete_failed') });
  }
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
