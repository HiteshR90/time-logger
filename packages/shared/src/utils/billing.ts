export interface InvoiceLineItemCalc {
  readonly hours: number;
  readonly rate: number;
}

/**
 * Calculate the subtotal for a set of invoice line items.
 */
export function calculateInvoiceSubtotal(
  lineItems: ReadonlyArray<InvoiceLineItemCalc>,
): number {
  return lineItems.reduce((sum, item) => sum + item.hours * item.rate, 0);
}

/**
 * Calculate the tax amount from a subtotal and tax rate percentage.
 */
export function calculateTaxAmount(
  subtotal: number,
  taxRatePercent: number,
): number {
  return Math.round(subtotal * (taxRatePercent / 100) * 100) / 100;
}

/**
 * Calculate total = subtotal + tax.
 */
export function calculateInvoiceTotal(
  subtotal: number,
  taxRatePercent: number,
): number {
  const tax = calculateTaxAmount(subtotal, taxRatePercent);
  return Math.round((subtotal + tax) * 100) / 100;
}

/**
 * Calculate budget consumption percentage.
 */
export function calculateBudgetConsumption(
  spent: number,
  budget: number,
): number {
  if (budget <= 0) return 0;
  return Math.round((spent / budget) * 10000) / 100;
}
