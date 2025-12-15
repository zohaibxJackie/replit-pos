import { db } from '../config/database.js';
import { taxes } from '../../shared/schema.js';
import { eq, and, desc, ilike } from 'drizzle-orm';

export const getTaxes = async (req, res) => {
  try {
    const shopId = req.userShopIds?.[0];
    const { search, isActive } = req.query;

    let conditions = [eq(taxes.shopId, shopId)];

    if (search) {
      conditions.push(ilike(taxes.name, `%${search}%`));
    }

    if (isActive !== undefined) {
      conditions.push(eq(taxes.isActive, isActive === 'true'));
    }

    const taxList = await db.select()
      .from(taxes)
      .where(and(...conditions))
      .orderBy(desc(taxes.createdAt));

    res.json({ taxes: taxList });
  } catch (error) {
    console.error('Get taxes error:', error);
    res.status(500).json({ error: req.t('tax.fetch_failed') });
  }
};

export const getTaxById = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.userShopIds?.[0];

    const [tax] = await db.select().from(taxes).where(
      and(eq(taxes.id, id), eq(taxes.shopId, shopId))
    ).limit(1);

    if (!tax) {
      return res.status(404).json({ error: req.t('tax.not_found') });
    }

    res.json({ tax });
  } catch (error) {
    console.error('Get tax by id error:', error);
    res.status(500).json({ error: req.t('tax.fetch_failed') });
  }
};

export const createTax = async (req, res) => {
  try {
    const { name, value } = req.body;
    const shopId = req.userShopIds?.[0];

    if (!name || value === undefined) {
      return res.status(400).json({ error: req.t('tax.missing_fields') });
    }

    if (value < 0) {
      return res.status(400).json({ error: req.t('tax.invalid_value') });
    }

    const [newTax] = await db.insert(taxes).values({
      shopId,
      name,
      type: 'flat',
      value: value.toString(),
      isActive: true
    }).returning();

    res.status(201).json({ tax: newTax });
  } catch (error) {
    console.error('Create tax error:', error);
    res.status(500).json({ error: req.t('tax.create_failed') });
  }
};

export const updateTax = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, value, isActive } = req.body;
    const shopId = req.userShopIds?.[0];

    const [existingTax] = await db.select().from(taxes).where(
      and(eq(taxes.id, id), eq(taxes.shopId, shopId))
    ).limit(1);

    if (!existingTax) {
      return res.status(404).json({ error: req.t('tax.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (value !== undefined) updateData.value = value.toString();
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedTax] = await db.update(taxes)
      .set(updateData)
      .where(eq(taxes.id, id))
      .returning();

    res.json({ tax: updatedTax });
  } catch (error) {
    console.error('Update tax error:', error);
    res.status(500).json({ error: req.t('tax.update_failed') });
  }
};

export const deleteTax = async (req, res) => {
  try {
    const { id } = req.params;
    const shopId = req.userShopIds?.[0];

    const [existingTax] = await db.select().from(taxes).where(
      and(eq(taxes.id, id), eq(taxes.shopId, shopId))
    ).limit(1);

    if (!existingTax) {
      return res.status(404).json({ error: req.t('tax.not_found') });
    }

    await db.delete(taxes).where(eq(taxes.id, id));

    res.json({ message: req.t('tax.deleted') });
  } catch (error) {
    console.error('Delete tax error:', error);
    res.status(500).json({ error: req.t('tax.delete_failed') });
  }
};

export default {
  getTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax
};
