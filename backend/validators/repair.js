import { z } from 'zod';

export const createRepairJobSchema = z.object({
  customerId: z.string().uuid().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerDni: z.string().optional(),
  deviceBrand: z.string().min(1, 'Device brand is required'),
  deviceModel: z.string().min(1, 'Device model is required'),
  imei: z.string().optional(),
  defectSummary: z.string().min(1, 'Defect summary is required'),
  problemDescription: z.string().min(1, 'Problem description is required'),
  priority: z.enum(['normal', 'urgent']).default('normal'),
  estimatedCost: z.number().positive().optional(),
  advancePayment: z.number().min(0).default(0),
  repairPersonId: z.string().uuid().optional(),
  autoAssign: z.boolean().default(false),
  dueDate: z.string().datetime().optional()
});

export const updateRepairJobSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled']).optional(),
  repairPersonId: z.string().uuid().optional(),
  estimatedCost: z.number().positive().optional(),
  notes: z.string().optional()
});

export const repairPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'bank_transfer']).default('cash'),
  note: z.string().optional()
});

export const createRepairPersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isAvailable: z.boolean().default(true)
});

export default { createRepairJobSchema, updateRepairJobSchema, repairPaymentSchema, createRepairPersonSchema };
