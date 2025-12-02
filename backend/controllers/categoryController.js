import { db } from '../config/database.js';
import { categories, products } from '../../shared/schema.js';
import { eq, and, desc, sql, isNull } from 'drizzle-orm';

export const getCategories = async (req, res) => {
  try {
    const shopId = req.userShopIds?.[0];
    const { type, parentId } = req.query;

    let conditions = [eq(categories.shopId, shopId)];

    if (type) {
      conditions.push(eq(categories.type, type));
    }

    if (parentId === 'null' || parentId === '') {
      conditions.push(isNull(categories.parentId));
    } else if (parentId) {
      conditions.push(eq(categories.parentId, parentId));
    }

    const categoryList = await db.select()
      .from(categories)
      .where(and(...conditions))
      .orderBy(categories.level, categories.name);

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
      and(eq(categories.id, id), eq(categories.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!category) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const [{ productCount }] = await db.select({ productCount: sql`count(*)::int` })
      .from(products)
      .where(eq(products.categoryId, id));

    const subcategories = await db.select()
      .from(categories)
      .where(eq(categories.parentId, id));

    res.json({
      category,
      productCount,
      subcategories
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: req.t('category.fetch_failed') });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, type, parentId } = req.body;

    let level = 1;
    if (parentId) {
      const [parentCategory] = await db.select().from(categories).where(
        and(eq(categories.id, parentId), eq(categories.shopId, req.userShopIds?.[0]))
      ).limit(1);

      if (!parentCategory) {
        return res.status(404).json({ error: req.t('category.parent_not_found') });
      }
      level = parentCategory.level + 1;
    }

    const [newCategory] = await db.insert(categories).values({
      shopId: req.userShopIds?.[0],
      name,
      type,
      parentId: parentId || null,
      level
    }).returning();

    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: req.t('category.create_failed') });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    const [existingCategory] = await db.select().from(categories).where(
      and(eq(categories.id, id), eq(categories.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingCategory) {
      return res.status(404).json({ error: req.t('category.not_found') });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;

    const [updatedCategory] = await db.update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    res.json({ category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: req.t('category.update_failed') });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingCategory] = await db.select().from(categories).where(
      and(eq(categories.id, id), eq(categories.shopId, req.userShopIds?.[0]))
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

    const subcategories = await db.select().from(categories).where(eq(categories.parentId, id));
    if (subcategories.length > 0) {
      return res.status(400).json({ error: req.t('category.has_subcategories') });
    }

    await db.delete(categories).where(eq(categories.id, id));

    res.json({ message: req.t('category.deleted') });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: req.t('category.delete_failed') });
  }
};

export default { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
