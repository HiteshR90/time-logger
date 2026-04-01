import type { InvoiceStatus } from "../enums";

export interface Invoice {
  readonly id: string;
  readonly orgId: string;
  readonly clientId: string;
  readonly invoiceNumber: string;
  readonly fromDate: Date;
  readonly toDate: Date;
  readonly subtotal: number;
  readonly taxRate: number;
  readonly taxAmount: number;
  readonly total: number;
  readonly status: InvoiceStatus;
  readonly pdfS3Key: string | null;
  readonly notes: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface InvoiceLineItem {
  readonly id: string;
  readonly invoiceId: string;
  readonly userId: string;
  readonly projectId: string;
  readonly description: string;
  readonly hours: number;
  readonly rate: number;
  readonly amount: number;
}
