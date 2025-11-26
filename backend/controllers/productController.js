import { db } from '../config/database.js';
import { products, categories } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or, lte } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, categoryId, lowStock } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.user.shopId;

    let conditions = [eq(products.shopId, shopId)];

    if (search) {
      conditions.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.barcode, `%${search}%`)
        )
      );
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
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
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [product] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.user.shopId))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let category = null;
    if (product.categoryId) {
      const [cat] = await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1);
      category = cat;
    }

    res.json({ product, category });
  } catch (error) {
    console.error('Get product by id error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getProductByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    const [product] = await db.select().from(products).where(
      and(eq(products.barcode, barcode), eq(products.shopId, req.user.shopId))
    ).limit(1);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, barcode, categoryId, price, stock, lowStockThreshold } = req.validatedBody;

    if (barcode) {
      const [existing] = await db.select().from(products).where(
        and(eq(products.barcode, barcode), eq(products.shopId, req.user.shopId))
      ).limit(1);
      if (existing) {
        return res.status(409).json({ error: 'Product with this barcode already exists' });
      }
    }

    const [newProduct] = await db.insert(products).values({
      shopId: req.user.shopId,
      name,
      barcode,
      categoryId,
      price: price.toString(),
      stock: stock || 0,
      lowStockThreshold: lowStockThreshold || 5
    }).returning();

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, barcode, categoryId, price, lowStockThreshold } = req.body;

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.user.shopId))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (price !== undefined) updateData.price = price.toString();
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

    const [updatedProduct] = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.validatedBody;

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.user.shopId))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newStock;
    switch (type) {
      case 'add':
        newStock = existingProduct.stock + quantity;
        break;
      case 'subtract':
        newStock = existingProduct.stock - quantity;
        if (newStock < 0) {
          return res.status(400).json({ error: 'Insufficient stock' });
        }
        break;
      case 'set':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({ error: 'Invalid stock update type' });
    }

    const [updatedProduct] = await db.update(products)
      .set({ stock: newStock })
      .where(eq(products.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingProduct] = await db.select().from(products).where(
      and(eq(products.id, id), eq(products.shopId, req.user.shopId))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.delete(products).where(eq(products.id, id));

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    const shopId = req.user.shopId;

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
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
};

export default {
  getProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getLowStockProducts
};
