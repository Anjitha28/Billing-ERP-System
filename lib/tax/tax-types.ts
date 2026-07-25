export type TaxCalculationResult = {
  subtotal: number;
  totalDiscount: number;
  taxableAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalGST: number;
  tdsRate: number;
  tdsAmount: number;
  grossAmount: number;
  netAmount: number;
};

export type GSTResult = {
  taxableAmount: number;
  gstRate: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalGST: number;
};

export type TDSResult = {
  taxableAmount: number;
  tdsRate: number;
  tdsAmount: number;
  netPayableAmount: number;
};

export type GSTSummaryGroup = {
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
};
