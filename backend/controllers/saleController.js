import { db } from '../config/database.js';
import { sales, saleItems, products, customers } from '../../shared/schema.js';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { paginationHelper } from '../utils/helpers.js';

export const getSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, paymentMethod } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);
    const shopId = req.user.shopId;

    let conditions = [eq(sales.shopId, shopId)];

    if (startDate) {
      conditions.push(gte(sales.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(sales.createdAt, new Date(endDate)));
    }

    if (paymentMethod) {
      conditions.push(eq(sales.paymentMethod, paymentMethod));
    }

    const whereClause = and(...conditions);

    const saleList = await db.select()
      .from(sales)
      .where(whereClause)
      .orderBy(desc(sales.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(sales)
      .where(whereClause);

    const [{ totalAmount }] = await db.select({
      totalAmount: sql`COALESCE(SUM(total), 0)::decimal`
    })
      .from(sales)
      .where(whereClause);

    res.json({
      sales: saleList,
      summary: { totalAmount },
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: req.t('sale.fetch_failed') });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const [sale] = await db.select().from(sales).where(
      and(eq(sales.id, id), eq(sales.shopId, req.user.shopId))
    ).limit(1);

    if (!sale) {
      return res.status(404).json({ error: req.t('sale.not_found') });
    }

    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, id));

    let customer = null;
    if (sale.customerId) {
      const [cust] = await db.select().from(customers).where(eq(customers.id, sale.customerId)).limit(1);
      customer = cust;
    }

    res.json({ sale, items, customer });
  } catch (error) {
    console.error('Get sale by id error:', error);
    res.status(500).json({ error: req.t('sale.fetch_failed') });
  }
};

export const createSale = async (req, res) => {
  try {
    const { customerId, paymentMethod, items, discount, tax } = req.validatedBody;
    const shopId = req.user.shopId;
    const salesPersonId = req.user.id;

    let subtotal = 0;
    const itemsWithTotal = [];

    for (const item of items) {
      const [product] = await db.select().from(products).where(
        and(eq(products.id, item.productId), eq(products.shopId, shopId))
      ).limit(1);

      if (!product) {
        return res.status(404).json({ error: req.t('product.product_id_not_found', { id: item.productId }) });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: req.t('product.insufficient_stock_for', { name: product.name }) });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      itemsWithTotal.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toString(),
        total: itemTotal.toString()
      });
    }

    const discountAmount = discount || 0;
    const taxAmount = tax || 0;
    const total = subtotal - discountAmount + taxAmount;

    const [newSale] = await db.insert(sales).values({
      shopId,
      salesPersonId,
      customerId: customerId || null,
      paymentMethod: paymentMethod || 'cash',
      subtotal: subtotal.toString(),
      discount: discountAmount.toString(),
      tax: taxAmount.toString(),
      total: total.toString()
    }).returning();

    for (const item of itemsWithTotal) {
      await db.insert(saleItems).values({
        saleId: newSale.id,
        ...item
      });

      await db.update(products)
        .set({ stock: sql`stock - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    if (customerId) {
      await db.update(customers)
        .set({ totalPurchases: sql`total_purchases + ${total}` })
        .where(eq(customers.id, customerId));
    }

    const insertedItems = await db.select().from(saleItems).where(eq(saleItems.saleId, newSale.id));

    res.status(201).json({ sale: newSale, items: insertedItems });
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: req.t('sale.create_failed') });
  }
};

export const getTodaySales = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await db.select()
      .from(sales)
      .where(
        and(
          eq(sales.shopId, shopId),
          gte(sales.createdAt, today)
        )
      )
      .orderBy(desc(sales.createdAt));

    const [{ totalAmount, saleCount }] = await db.select({
      totalAmount: sql`COALESCE(SUM(total), 0)::decimal`,
      saleCount: sql`count(*)::int`
    })
      .from(sales)
      .where(
        and(
          eq(sales.shopId, shopId),
          gte(sales.createdAt, today)
        )
      );

    res.json({
      sales: todaySales,
      summary: {
        totalAmount,
        saleCount
      }
    });
  } catch (error) {
    console.error('Get today sales error:', error);
    res.status(500).json({ error: req.t('sale.today_fetch_failed') });
  }
};

export const getSalesAnalytics = async (req, res) => {
  try {
    const shopId = req.user.shopId;
    const { period = 'week' } = req.query;

    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const [stats] = await db.select({
      totalSales: sql`COALESCE(SUM(total), 0)::decimal`,
      saleCount: sql`count(*)::int`,
      avgSale: sql`COALESCE(AVG(total), 0)::decimal`
    })
      .from(sales)
      .where(
        and(
          eq(sales.shopId, shopId),
          gte(sales.createdAt, startDate)
        )
      );

    const dailySales = await db.select({
      date: sql`DATE(created_at)`,
      total: sql`SUM(total)::decimal`,
      count: sql`count(*)::int`
    })
      .from(sales)
      .where(
        and(
          eq(sales.shopId, shopId),
          gte(sales.createdAt, startDate)
        )
      )
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    res.json({
      period,
      stats,
      dailySales
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ error: req.t('sale.analytics_fetch_failed') });
  }
};

export default { getSales, getSaleById, createSale, getTodaySales, getSalesAnalytics };
