import { z } from 'zod';

// ============================================================================
// REPAIR CENTER SETTINGS VALIDATORS
// ============================================================================

export const createRepairCenterSettingsSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  warrantyTerms: z.string().max(2000, 'Warranty terms are too long').optional().nullable(),
  estimatedTurnaround: z.string().max(200, 'Estimated turnaround is too long').optional().nullable(),
  acceptsWalkIns: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true)
});

export const updateRepairCenterSettingsSchema = z.object({
  warrantyTerms: z.string().max(2000, 'Warranty terms are too long').optional().nullable(),
  estimatedTurnaround: z.string().max(200, 'Estimated turnaround is too long').optional().nullable(),
  acceptsWalkIns: z.boolean().optional(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// REPAIR SERVICES VALIDATORS
// ============================================================================

export const createRepairServiceSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID'),
  serviceName: z.string().min(1, 'Service name is required').max(200, 'Service name is too long'),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  basePrice: z.union([
    z.number().min(0, 'Base price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  estimatedTime: z.string().max(100, 'Estimated time is too long').optional().nullable(),
  isActive: z.boolean().optional().default(true)
});

export const updateRepairServiceSchema = z.object({
  serviceName: z.string().min(1, 'Service name is required').max(200, 'Service name is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional().nullable(),
  basePrice: z.union([
    z.number().min(0, 'Base price cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  estimatedTime: z.string().max(100, 'Estimated time is too long').optional().nullable(),
  isActive: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// REPAIR PERSON VALIDATORS
// ============================================================================

export const createRepairPersonSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().max(20, 'Phone is too long').optional().nullable(),
  email: z.string().email('Invalid email format').max(100, 'Email is too long').optional().nullable(),
  isAvailable: z.boolean().optional().default(true)
});

export const updateRepairPersonSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long').optional(),
  phone: z.string().max(20, 'Phone is too long').optional().nullable(),
  email: z.string().email('Invalid email format').max(100, 'Email is too long').optional().nullable(),
  isAvailable: z.boolean().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// ============================================================================
// REPAIR JOB VALIDATORS
// ============================================================================

export const createRepairJobSchema = z.object({
  shopId: z.string().uuid('Invalid shop ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name is too long'),
  customerPhone: z.string().min(1, 'Customer phone is required').max(20, 'Customer phone is too long'),
  customerDni: z.string().max(20, 'Customer DNI is too long').optional().nullable(),
  deviceBrand: z.string().min(1, 'Device brand is required').max(50, 'Device brand is too long'),
  deviceModel: z.string().min(1, 'Device model is required').max(100, 'Device model is too long'),
  imei: z.string().max(20, 'IMEI is too long').optional().nullable(),
  defectSummary: z.string().min(1, 'Defect summary is required').max(200, 'Defect summary is too long'),
  problemDescription: z.string().min(1, 'Problem description is required').max(2000, 'Problem description is too long'),
  priority: z.enum(['normal', 'urgent']).optional().default('normal'),
  estimatedCost: z.union([
    z.number().min(0, 'Estimated cost cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  advancePayment: z.union([
    z.number().min(0, 'Advance payment cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid payment format').transform(v => parseFloat(v))
  ]).optional().default(0),
  repairPersonId: z.string().uuid('Invalid repair person ID').optional().nullable(),
  autoAssign: z.boolean().optional().default(false),
  dueDate: z.string().datetime().optional().nullable(),
  photos: z.array(z.string().url('Invalid photo URL')).optional().nullable()
});

export const updateRepairJobSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required').max(100, 'Customer name is too long').optional(),
  customerPhone: z.string().min(1, 'Customer phone is required').max(20, 'Customer phone is too long').optional(),
  customerDni: z.string().max(20, 'Customer DNI is too long').optional().nullable(),
  deviceBrand: z.string().min(1, 'Device brand is required').max(50, 'Device brand is too long').optional(),
  deviceModel: z.string().min(1, 'Device model is required').max(100, 'Device model is too long').optional(),
  imei: z.string().max(20, 'IMEI is too long').optional().nullable(),
  defectSummary: z.string().min(1, 'Defect summary is required').max(200, 'Defect summary is too long').optional(),
  problemDescription: z.string().min(1, 'Problem description is required').max(2000, 'Problem description is too long').optional(),
  priority: z.enum(['normal', 'urgent']).optional(),
  status: z.enum(['pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled']).optional(),
  estimatedCost: z.union([
    z.number().min(0, 'Estimated cost cannot be negative'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid cost format').transform(v => parseFloat(v)),
    z.null()
  ]).optional().nullable(),
  repairPersonId: z.string().uuid('Invalid repair person ID').optional().nullable(),
  repairPersonName: z.string().max(100, 'Repair person name is too long').optional().nullable(),
  autoAssign: z.boolean().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  photos: z.array(z.string().url('Invalid photo URL')).optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

export const updateRepairJobStatusSchema = z.object({
  status: z.enum(['pending', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'delivered', 'cancelled']),
  repairPersonId: z.string().uuid('Invalid repair person ID').optional().nullable(),
  repairPersonName: z.string().max(100, 'Repair person name is too long').optional().nullable()
});

// ============================================================================
// REPAIR PAYMENT VALIDATORS
// ============================================================================

export const createRepairPaymentSchema = z.object({
  repairJobId: z.string().uuid('Invalid repair job ID'),
  amount: z.union([
    z.number().positive('Amount must be positive'),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format').transform(v => parseFloat(v))
  ]),
  paymentMethod: z.enum(['cash', 'card', 'mobile', 'bank_transfer']).optional().default('cash'),
  note: z.string().max(500, 'Note is too long').optional().nullable()
});

export const repairPaymentSchema = createRepairPaymentSchema;

export default {
  createRepairCenterSettingsSchema,
  updateRepairCenterSettingsSchema,
  createRepairServiceSchema,
  updateRepairServiceSchema,
  createRepairPersonSchema,
  updateRepairPersonSchema,
  createRepairJobSchema,
  updateRepairJobSchema,
  updateRepairJobStatusSchema,
  createRepairPaymentSchema,
  repairPaymentSchema
};
