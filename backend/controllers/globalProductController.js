import { db } from '../config/database.js';
import { product, category, brand, variant } from '../../shared/schema.js';
import { eq, sql, ilike, and, desc, or } from 'drizzle-orm';
import { createGlobalProductSchema, updateGlobalProductSchema } from '../validators/inventory.js';
import { paginationHelper } from '../utils/helpers.js';

export const getGlobalProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, categoryId, brandId, isActive } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    
    let conditions = [];
    
    if (search) {
      conditions.push(ilike(product.name, `%${search}%`));
    }
    
    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }
    
    if (brandId) {
      conditions.push(eq(product.brandId, brandId));
    }
    
    if (isActive !== undefined) {
      conditions.push(eq(product.isActive, isActive === 'true'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const productList = await db.select({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: category.name,
      brandName: brand.name
    })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(whereClause)
      .orderBy(desc(product.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(product)
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
    console.error('Get global products error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const getGlobalProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [prod] = await db.select({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categoryName: category.name,
      brandName: brand.name
    })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(eq(product.id, id))
      .limit(1);

    if (!prod) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    const [{ variantCount }] = await db.select({ variantCount: sql`count(*)::int` })
      .from(variant)
      .where(eq(variant.productId, id));

    res.json({
      product: prod,
      variantCount
    });
  } catch (error) {
    console.error('Get global product by id error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const searchGlobalProducts = async (req, res) => {
  try {
    const { q, categoryId, brandId, limit = 10 } = req.query;
    
    let conditions = [eq(product.isActive, true)];
    
    if (q) {
      conditions.push(ilike(product.name, `%${q}%`));
    }
    
    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }
    
    if (brandId) {
      conditions.push(eq(product.brandId, brandId));
    }

    const results = await db.select({
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      brandId: product.brandId,
      categoryName: category.name,
      brandName: brand.name
    })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(and(...conditions))
      .orderBy(product.name)
      .limit(parseInt(limit));

    res.json({ products: results });
  } catch (error) {
    console.error('Search global products error:', error);
    res.status(500).json({ error: req.t('product.fetch_failed') });
  }
};

export const createGlobalProduct = async (req, res) => {
  try {
    const validation = createGlobalProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, categoryId, brandId, isActive } = validation.data;

    const [cat] = await db.select().from(category).where(eq(category.id, categoryId)).limit(1);
    if (!cat) {
      return res.status(400).json({ error: req.t('category.not_found') });
    }

    const [br] = await db.select().from(brand).where(eq(brand.id, brandId)).limit(1);
    if (!br) {
      return res.status(400).json({ error: req.t('brand.not_found') });
    }

    const [newProduct] = await db.insert(product).values({
      name,
      categoryId,
      brandId,
      isActive: isActive ?? true
    }).returning();

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create global product error:', error);
    res.status(500).json({ error: req.t('product.create_failed') });
  }
};

export const updateGlobalProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const validation = updateGlobalProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const [existingProduct] = await db.select().from(product).where(
      eq(product.id, id)
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    
    if (validation.data.name !== undefined) {
      updateData.name = validation.data.name;
    }
    
    if (validation.data.categoryId !== undefined) {
      const [cat] = await db.select().from(category).where(eq(category.id, validation.data.categoryId)).limit(1);
      if (!cat) {
        return res.status(400).json({ error: req.t('category.not_found') });
      }
      updateData.categoryId = validation.data.categoryId;
    }
    
    if (validation.data.brandId !== undefined) {
      const [br] = await db.select().from(brand).where(eq(brand.id, validation.data.brandId)).limit(1);
      if (!br) {
        return res.status(400).json({ error: req.t('brand.not_found') });
      }
      updateData.brandId = validation.data.brandId;
    }
    
    if (validation.data.isActive !== undefined) {
      updateData.isActive = validation.data.isActive;
    }

    const [updatedProduct] = await db.update(product)
      .set(updateData)
      .where(eq(product.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update global product error:', error);
    res.status(500).json({ error: req.t('product.update_failed') });
  }
};

export const deleteGlobalProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingProduct] = await db.select().from(product).where(
      eq(product.id, id)
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('product.not_found') });
    }

    const [{ variantCount }] = await db.select({ variantCount: sql`count(*)::int` })
      .from(variant)
      .where(eq(variant.productId, id));

    if (variantCount > 0) {
      return res.status(400).json({ error: req.t('product.has_variants') });
    }

    await db.delete(product).where(eq(product.id, id));

    res.json({ message: req.t('product.deleted') });
  } catch (error) {
    console.error('Delete global product error:', error);
    res.status(500).json({ error: req.t('product.delete_failed') });
  }
};

export default { 
  getGlobalProducts, 
  getGlobalProductById, 
  searchGlobalProducts,
  createGlobalProduct, 
  updateGlobalProduct, 
  deleteGlobalProduct 
};
