import { db } from '../config/database.js';
import { customers, sales } from '../../shared/schema.js';
import { eq, and, desc, ilike, sql, or } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.user.shopId;

    let conditions = [eq(customers.shopId, shopId)];

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
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const [customer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.user.shopId))
    ).limit(1);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customerSales = await db.select()
      .from(sales)
      .where(eq(sales.customerId, id))
      .orderBy(desc(sales.createdAt))
      .limit(10);

    res.json({ customer, recentSales: customerSales });
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.validatedBody;

    const [newCustomer] = await db.insert(customers).values({
      shopId: req.user.shopId,
      name,
      email,
      phone,
      address
    }).returning();

    res.status(201).json({ customer: newCustomer });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const [existingCustomer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.user.shopId))
    ).limit(1);

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    const [updatedCustomer] = await db.update(customers)
      .set(updateData)
      .where(eq(customers.id, id))
      .returning();

    res.json({ customer: updatedCustomer });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingCustomer] = await db.select().from(customers).where(
      and(eq(customers.id, id), eq(customers.shopId, req.user.shopId))
    ).limit(1);

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    await db.delete(customers).where(eq(customers.id, id));

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

export default { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
