import { db } from '../config/database.js';
import { wholesalerProducts, purchaseOrders, purchaseOrderItems, dealRequests, shops, users } from '../../shared/schema.js';
import { eq, and, desc, sql, or, ilike, ne } from 'drizzle-orm';
import { paginationHelper, generateOrderNumber } from '../utils/helpers.js';

export const getWholesalerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, wholesalerId } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [eq(wholesalerProducts.isActive, true)];

    if (wholesalerId) {
      conditions.push(eq(wholesalerProducts.wholesalerId, wholesalerId));
    } else if (req.user.role === 'wholesaler') {
      conditions.push(eq(wholesalerProducts.wholesalerId, req.user.id));
    }

    if (category) {
      conditions.push(eq(wholesalerProducts.category, category));
    }

    if (search) {
      conditions.push(
        or(
          ilike(wholesalerProducts.name, `%${search}%`),
          ilike(wholesalerProducts.description, `%${search}%`)
        )
      );
    }

    const whereClause = and(...conditions);

    const productList = await db.select()
      .from(wholesalerProducts)
      .where(whereClause)
      .orderBy(desc(wholesalerProducts.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(wholesalerProducts)
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
    console.error('Get wholesaler products error:', error);
    res.status(500).json({ error: req.t('wholesaler.products_fetch_failed') });
  }
};

export const getWholesalerProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [product] = await db.select().from(wholesalerProducts).where(eq(wholesalerProducts.id, id)).limit(1);

    if (!product) {
      return res.status(404).json({ error: req.t('wholesaler.product_not_found') });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get wholesaler product by id error:', error);
    res.status(500).json({ error: req.t('wholesaler.products_fetch_failed') });
  }
};

export const createWholesalerProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, discount, minOrderQuantity, unit, imageUrl } = req.validatedBody;

    if (req.user.role !== 'wholesaler') {
      return res.status(403).json({ error: req.t('wholesaler.only_wholesalers_create') });
    }

    const [newProduct] = await db.insert(wholesalerProducts).values({
      wholesalerId: req.user.id,
      name,
      description,
      category,
      price: price.toString(),
      stock: stock || 0,
      discount: (discount || 0).toString(),
      minOrderQuantity: minOrderQuantity || 1,
      unit: unit || 'pack',
      imageUrl
    }).returning();

    res.status(201).json({ product: newProduct });
  } catch (error) {
    console.error('Create wholesaler product error:', error);
    res.status(500).json({ error: req.t('wholesaler.product_create_failed') });
  }
};

export const updateWholesalerProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, price, stock, discount, minOrderQuantity, unit, imageUrl, isActive } = req.body;

    const [existingProduct] = await db.select().from(wholesalerProducts).where(
      and(eq(wholesalerProducts.id, id), eq(wholesalerProducts.wholesalerId, req.user.id))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('wholesaler.product_not_found') });
    }

    const updateData = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (price !== undefined) updateData.price = price.toString();
    if (stock !== undefined) updateData.stock = stock;
    if (discount !== undefined) updateData.discount = discount.toString();
    if (minOrderQuantity !== undefined) updateData.minOrderQuantity = minOrderQuantity;
    if (unit) updateData.unit = unit;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    const [updatedProduct] = await db.update(wholesalerProducts)
      .set(updateData)
      .where(eq(wholesalerProducts.id, id))
      .returning();

    res.json({ product: updatedProduct });
  } catch (error) {
    console.error('Update wholesaler product error:', error);
    res.status(500).json({ error: req.t('wholesaler.product_update_failed') });
  }
};

export const deleteWholesalerProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingProduct] = await db.select().from(wholesalerProducts).where(
      and(eq(wholesalerProducts.id, id), eq(wholesalerProducts.wholesalerId, req.user.id))
    ).limit(1);

    if (!existingProduct) {
      return res.status(404).json({ error: req.t('wholesaler.product_not_found') });
    }

    await db.update(wholesalerProducts)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(wholesalerProducts.id, id));

    res.json({ message: req.t('wholesaler.product_deactivated') });
  } catch (error) {
    console.error('Delete wholesaler product error:', error);
    res.status(500).json({ error: req.t('wholesaler.product_delete_failed') });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (req.user.role === 'wholesaler') {
      conditions.push(eq(purchaseOrders.wholesalerId, req.user.id));
    } else {
      conditions.push(eq(purchaseOrders.shopId, req.user.shopId));
    }

    if (status) {
      conditions.push(eq(purchaseOrders.status, status));
    }

    const whereClause = and(...conditions);

    const orders = await db.select()
      .from(purchaseOrders)
      .where(whereClause)
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(purchaseOrders)
      .where(whereClause);

    res.json({
      purchaseOrders: orders,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: req.t('wholesaler.orders_fetch_failed') });
  }
};

export const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const [order] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);

    if (!order) {
      return res.status(404).json({ error: req.t('wholesaler.order_not_found') });
    }

    if (req.user.role !== 'super_admin' &&
        order.wholesalerId !== req.user.id &&
        order.shopId !== req.user.shopId) {
      return res.status(403).json({ error: req.t('wholesaler.access_denied') });
    }

    const items = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, id));

    res.json({ purchaseOrder: order, items });
  } catch (error) {
    console.error('Get purchase order by id error:', error);
    res.status(500).json({ error: req.t('wholesaler.order_fetch_failed') });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { wholesalerId, contactPerson, items, notes } = req.validatedBody;
    const shopId = req.user.shopId;

    const [shop] = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    if (!shop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    let subtotal = 0;
    const itemsWithTotal = [];

    for (const item of items) {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      itemsWithTotal.push({
        ...item,
        total: itemTotal.toString(),
        price: item.price.toString()
      });
    }

    const orderNumber = generateOrderNumber('PO');

    const [newOrder] = await db.insert(purchaseOrders).values({
      orderNumber,
      shopId,
      wholesalerId,
      shopName: shop.name,
      shopAddress: shop.address,
      shopPhone: shop.phone,
      shopEmail: user?.email,
      contactPerson,
      status: 'pending',
      subtotal: subtotal.toString(),
      discount: '0',
      total: subtotal.toString(),
      notes
    }).returning();

    for (const item of itemsWithTotal) {
      await db.insert(purchaseOrderItems).values({
        purchaseOrderId: newOrder.id,
        wholesalerProductId: item.wholesalerProductId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
    }

    const insertedItems = await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, newOrder.id));

    res.status(201).json({ purchaseOrder: newOrder, items: insertedItems });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: req.t('wholesaler.order_create_failed') });
  }
};

export const updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, wholesalerResponse } = req.validatedBody;

    const [existingOrder] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).limit(1);

    if (!existingOrder) {
      return res.status(404).json({ error: req.t('wholesaler.order_not_found') });
    }

    if (req.user.role !== 'wholesaler' || existingOrder.wholesalerId !== req.user.id) {
      return res.status(403).json({ error: req.t('wholesaler.only_wholesaler_update_status') });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (wholesalerResponse) {
      updateData.wholesalerResponse = wholesalerResponse;
    }

    const [updatedOrder] = await db.update(purchaseOrders)
      .set(updateData)
      .where(eq(purchaseOrders.id, id))
      .returning();

    res.json({ purchaseOrder: updatedOrder });
  } catch (error) {
    console.error('Update purchase order status error:', error);
    res.status(500).json({ error: req.t('wholesaler.order_update_failed') });
  }
};

export const getDealRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { offset, limit: pageLimit } = paginationHelper(page, limit);

    let conditions = [];

    if (req.user.role === 'wholesaler') {
      conditions.push(eq(dealRequests.wholesalerId, req.user.id));
    } else {
      conditions.push(eq(dealRequests.shopId, req.user.shopId));
    }

    if (status) {
      conditions.push(eq(dealRequests.status, status));
    }

    const whereClause = and(...conditions);

    const requests = await db.select()
      .from(dealRequests)
      .where(whereClause)
      .orderBy(desc(dealRequests.createdAt))
      .limit(pageLimit)
      .offset(offset);

    const [{ count }] = await db.select({ count: sql`count(*)::int` })
      .from(dealRequests)
      .where(whereClause);

    res.json({
      dealRequests: requests,
      pagination: {
        page: parseInt(page),
        limit: pageLimit,
        total: count,
        totalPages: Math.ceil(count / pageLimit)
      }
    });
  } catch (error) {
    console.error('Get deal requests error:', error);
    res.status(500).json({ error: req.t('wholesaler.deals_fetch_failed') });
  }
};

export const createDealRequest = async (req, res) => {
  try {
    const { wholesalerId, wholesalerProductId, productName, requestedDiscount, requestedPrice, quantity, message } = req.validatedBody;
    const shopId = req.user.shopId;

    const [shop] = await db.select().from(shops).where(eq(shops.id, shopId)).limit(1);
    if (!shop) {
      return res.status(404).json({ error: req.t('shop.not_found') });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    const [newRequest] = await db.insert(dealRequests).values({
      shopId,
      wholesalerId,
      shopName: shop.name,
      shopPhone: shop.phone,
      shopEmail: user?.email,
      wholesalerProductId,
      productName,
      requestedDiscount: requestedDiscount?.toString(),
      requestedPrice: requestedPrice?.toString(),
      quantity,
      message,
      status: 'pending'
    }).returning();

    res.status(201).json({ dealRequest: newRequest });
  } catch (error) {
    console.error('Create deal request error:', error);
    res.status(500).json({ error: req.t('wholesaler.deal_create_failed') });
  }
};

export const updateDealRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, wholesalerResponse } = req.body;

    const [existingRequest] = await db.select().from(dealRequests).where(eq(dealRequests.id, id)).limit(1);

    if (!existingRequest) {
      return res.status(404).json({ error: req.t('wholesaler.deal_not_found') });
    }

    if (req.user.role !== 'wholesaler' || existingRequest.wholesalerId !== req.user.id) {
      return res.status(403).json({ error: req.t('wholesaler.only_wholesaler_update_deal') });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (wholesalerResponse) {
      updateData.wholesalerResponse = wholesalerResponse;
    }

    const [updatedRequest] = await db.update(dealRequests)
      .set(updateData)
      .where(eq(dealRequests.id, id))
      .returning();

    res.json({ dealRequest: updatedRequest });
  } catch (error) {
    console.error('Update deal request status error:', error);
    res.status(500).json({ error: req.t('wholesaler.deal_update_failed') });
  }
};

export const getWholesalers = async (req, res) => {
  try {
    const { search } = req.query;

    let conditions = [eq(users.role, 'wholesaler'), eq(users.active, true)];

    if (search) {
      conditions.push(
        or(
          ilike(users.businessName, `%${search}%`),
          ilike(users.username, `%${search}%`)
        )
      );
    }

    const wholesalers = await db.select({
      id: users.id,
      username: users.username,
      businessName: users.businessName,
      phone: users.phone,
      whatsapp: users.whatsapp,
      address: users.address
    })
      .from(users)
      .where(and(...conditions))
      .orderBy(users.businessName);

    res.json({ wholesalers });
  } catch (error) {
    console.error('Get wholesalers error:', error);
    res.status(500).json({ error: req.t('wholesaler.wholesalers_fetch_failed') });
  }
};

export default {
  getWholesalerProducts,
  getWholesalerProductById,
  createWholesalerProduct,
  updateWholesalerProduct,
  deleteWholesalerProduct,
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  getDealRequests,
  createDealRequest,
  updateDealRequestStatus,
  getWholesalers
};
