import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => uuidv4();

export const generateOrderNumber = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateTicketNumber = (prefix = 'TKT') => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
};

export const formatCurrency = (amount, currency = 'PKR') => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency
  }).format(amount);
};

export const calculateDiscount = (subtotal, discountPercentage) => {
  return (subtotal * discountPercentage) / 100;
};

export const calculateTax = (subtotal, taxPercentage) => {
  return (subtotal * taxPercentage) / 100;
};

export const paginationHelper = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export default {
  generateUUID,
  generateOrderNumber,
  generateTicketNumber,
  formatCurrency,
  calculateDiscount,
  calculateTax,
  paginationHelper,
  sanitizeUser
};
