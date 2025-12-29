import { db } from "../config/database.js";
import {
  variant,
  product,
  categories,
  brand,
  stock,
} from "../../shared/schema.js";
import { eq, sql, ilike, and, desc, or } from "drizzle-orm";
import {
  createVariantSchema,
  updateVariantSchema,
  variantSearchSchema,
} from "../validators/inventory.js";
import { paginationHelper } from "../utils/helpers.js";

export const getVariants = async (req, res) => {
  try {
    const validation = variantSearchSchema.safeParse(req.query);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      productId,
      isActive,
    } = validation.data;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(variant.variantName, `%${search}%`),
          ilike(variant.sku, `%${search}%`),
          ilike(variant.color, `%${search}%`)
        )
      );
    }

    if (productId) {
      conditions.push(eq(variant.productId, productId));
    }

    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }

    if (brandId) {
      conditions.push(eq(product.brandId, brandId));
    }

    if (isActive !== undefined) {
      conditions.push(eq(variant.isActive, isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const variantList = await db
      .select({
        id: variant.id,
        productId: variant.productId,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        sku: variant.sku,
        isActive: variant.isActive,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        productName: product.name,
        categoryId: product.categoryId,
        brandId: product.brandId,
        categoryName: categories.name,
        brandName: brand.name,
      })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(whereClause)
      .orderBy(desc(variant.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .where(whereClause);

    res.json({
      variants: variantList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get variants error:", error);
    res.status(500).json({ error: req.t("variant.fetch_failed") });
  }
};

export const getVariantById = async (req, res) => {
  try {
    const { id } = req.params;

    const [var_] = await db
      .select({
        id: variant.id,
        productId: variant.productId,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        sku: variant.sku,
        isActive: variant.isActive,
        createdAt: variant.createdAt,
        updatedAt: variant.updatedAt,
        productName: product.name,
        categoryId: product.categoryId,
        brandId: product.brandId,
        categoryName: categories.name,
        brandName: brand.name,
      })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(eq(variant.id, id))
      .limit(1);

    if (!var_) {
      return res.status(404).json({ error: req.t("variant.not_found") });
    }

    const [{ stockCount }] = await db
      .select({ stockCount: sql`count(*)::int` })
      .from(stock)
      .where(eq(stock.variantId, id));

    res.json({
      variant: var_,
      stockCount,
    });
  } catch (error) {
    console.error("Get variant by id error:", error);
    res.status(500).json({ error: req.t("variant.fetch_failed") });
  }
};

export const searchVariants = async (req, res) => {
  try {
    const { q, productId, categoryId, brandId, limit = 10 } = req.query;

    let conditions = [eq(variant.isActive, true)];

    if (q) {
      conditions.push(
        or(
          ilike(variant.variantName, `%${q}%`),
          ilike(variant.sku, `%${q}%`),
          ilike(product.name, `%${q}%`)
        )
      );
    }

    if (productId) {
      conditions.push(eq(variant.productId, productId));
    }

    if (categoryId) {
      conditions.push(eq(product.categoryId, categoryId));
    }

    if (brandId) {
      conditions.push(eq(product.brandId, brandId));
    }

    const results = await db
      .select({
        id: variant.id,
        productId: variant.productId,
        variantName: variant.variantName,
        color: variant.color,
        storageSize: variant.storageSize,
        sku: variant.sku,
        productName: product.name,
        categoryName: categories.name,
        brandName: brand.name,
      })
      .from(variant)
      .leftJoin(product, eq(variant.productId, product.id))
      .leftJoin(categories, eq(product.categoryId, categories.id))
      .leftJoin(brand, eq(product.brandId, brand.id))
      .where(and(...conditions))
      .orderBy(variant.variantName)
      .limit(parseInt(limit));

    res.json({ variants: results });
  } catch (error) {
    console.error("Search variants error:", error);
    res.status(500).json({ error: req.t("variant.fetch_failed") });
  }
};

export const createVariant = async (req, res) => {
  try {
    const validation = createVariantSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const { productId, variantName, color, storageSize, sku, isActive } =
      validation.data;

    const [prod] = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);
    if (!prod) {
      return res.status(400).json({ error: req.t("product.not_found") });
    }

    const [newVariant] = await db
      .insert(variant)
      .values({
        productId,
        variantName,
        color: color || null,
        storageSize: storageSize || null,
        sku: sku || null,
        isActive: isActive ?? true,
      })
      .returning();

    res.status(201).json({ variant: newVariant });
  } catch (error) {
    console.error("Create variant error:", error);
    res.status(500).json({ error: req.t("variant.create_failed") });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const validation = updateVariantSchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const [existingVariant] = await db
      .select()
      .from(variant)
      .where(eq(variant.id, id))
      .limit(1);

    if (!existingVariant) {
      return res.status(404).json({ error: req.t("variant.not_found") });
    }

    const updateData = { updatedAt: new Date() };

    if (validation.data.variantName !== undefined) {
      updateData.variantName = validation.data.variantName;
    }
    if (validation.data.color !== undefined) {
      updateData.color = validation.data.color;
    }
    if (validation.data.storageSize !== undefined) {
      updateData.storageSize = validation.data.storageSize;
    }
    if (validation.data.sku !== undefined) {
      updateData.sku = validation.data.sku;
    }
    if (validation.data.isActive !== undefined) {
      updateData.isActive = validation.data.isActive;
    }

    const [updatedVariant] = await db
      .update(variant)
      .set(updateData)
      .where(eq(variant.id, id))
      .returning();

    res.json({ variant: updatedVariant });
  } catch (error) {
    console.error("Update variant error:", error);
    res.status(500).json({ error: req.t("variant.update_failed") });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingVariant] = await db
      .select()
      .from(variant)
      .where(eq(variant.id, id))
      .limit(1);

    if (!existingVariant) {
      return res.status(404).json({ error: req.t("variant.not_found") });
    }

    const [{ stockCount }] = await db
      .select({ stockCount: sql`count(*)::int` })
      .from(stock)
      .where(eq(stock.variantId, id));

    if (stockCount > 0) {
      return res.status(400).json({ error: req.t("variant.has_stock") });
    }

    await db.delete(variant).where(eq(variant.id, id));

    res.json({ message: req.t("variant.deleted") });
  } catch (error) {
    console.error("Delete variant error:", error);
    res.status(500).json({ error: req.t("variant.delete_failed") });
  }
};

export default {
  getVariants,
  getVariantById,
  searchVariants,
  createVariant,
  updateVariant,
  deleteVariant,
};
