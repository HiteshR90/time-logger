import { z } from "zod";

export const GenerateInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  fromDate: z.string().datetime(),
  toDate: z.string().datetime(),
  taxRate: z.number().min(0).max(100).default(0),
  notes: z.string().max(2000).nullable().optional(),
});
export type GenerateInvoiceInput = z.infer<typeof GenerateInvoiceSchema>;

export const UpdateInvoiceSchema = z.object({
  taxRate: z.number().min(0).max(100).optional(),
  notes: z.string().max(2000).nullable().optional(),
});
export type UpdateInvoiceInput = z.infer<typeof UpdateInvoiceSchema>;

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid"]),
});
export type UpdateInvoiceStatusInput = z.infer<
  typeof UpdateInvoiceStatusSchema
>;

export const UpdateLineItemSchema = z.object({
  description: z.string().max(500).optional(),
  hours: z.number().min(0).optional(),
  rate: z.number().min(0).optional(),
});
export type UpdateLineItemInput = z.infer<typeof UpdateLineItemSchema>;
