import { db } from '../config/database.js';
import { customers, sales } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.userShopIds?.[0];

    let conditions = [eq(customers.shopId, shopId), eq(customers.isActive, true)];

    if (search) {
      conditions.push(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.phone, `%${search}%`),
          ilike(customers.email, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    const customerList = await db.select()
      .from(customers)
      .where(whereClause)
      .orderBy(desc(customers.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(customers)
      .where(whereClause);

    res.json({
      customers: customerList,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: req.t('customer.fetch_failed') });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [customer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!customer) {
      return res.status(404).json({ error: req.t('customer.not_found') });
    }

    const customerSales = await db.select()
      .from(sales)
      .where(eq(sales.customerId, id))
      .orderBy(desc(sales.createdAt))
      .limit(10);

    res.json({ customer, recentSales: customerSales });
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ error: req.t('customer.fetch_failed') });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { 
      name, email, phone, address, 
      documentType, documentNumber, dob, nationality,
      postalCode, city, province, status 
    } = req.validatedBody;

    const [newCustomer] = await db.insert(customers).values({
      shopId: req.userShopIds?.[0],
      name,
      email: email || null,
      phone: phone || null,
      documentType: documentType || null,
      documentNumber: documentNumber || null,
      dob: dob || null,
      nationality: nationality || null,
      address: address || null,
      postalCode: postalCode || null,
      city: city || null,
      province: province || null,
      status: status || 'active'
    }).returning();

    res.status(201).json({ customer: newCustomer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: req.t('customer.create_failed') });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, email, phone, address,
      documentType, documentNumber, dob, nationality,
      postalCode, city, province, status
    } = req.validatedBody || req.body;

    const [existingCustomer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingCustomer) {
      return res.status(404).json({ error: req.t('customer.not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (address !== undefined) updateData.address = address || null;
    if (documentType !== undefined) updateData.documentType = documentType || null;
    if (documentNumber !== undefined) updateData.documentNumber = documentNumber || null;
    if (dob !== undefined) updateData.dob = dob || null;
    if (nationality !== undefined) updateData.nationality = nationality || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    if (city !== undefined) updateData.city = city || null;
    if (province !== undefined) updateData.province = province || null;
    if (status !== undefined) updateData.status = status || 'active';

    const [updatedCustomer] = await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();

    res.json({ customer: updatedCustomer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: req.t('customer.update_failed') });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingCustomer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.userShopIds?.[0]))
    ).limit(1);

    if (!existingCustomer) {
      return res.status(404).json({ error: req.t('customer.not_found') });
    }

    await db.update(customers)
    .set({isActive : false})
    .where(eq(customers.id, id))

    res.json({ message: req.t('customer.deleted') });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: req.t('customer.delete_failed') });
  }
};

export default { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
