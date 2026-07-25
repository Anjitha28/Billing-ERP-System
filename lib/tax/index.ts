import { GSTCalculator } from "./gst-calculator";
import { TDSCalculator } from "./tds-calculator";
import { TaxCalculationResult } from "./tax-types";

type CalculateInvoiceTaxArgs = {
  items: {
    taxableAmount: number;
    gstRate: number;
    grossAmount: number;
    discountAmount: number;
  }[];
  businessState: string;
  customerState: string;
  tdsRate?: number;
};

export class TaxEngine {
  static calculateInvoiceTaxes({
    items,
    businessState,
    customerState,
    tdsRate = 0,
  }: CalculateInvoiceTaxArgs): TaxCalculationResult & { calculatedItems: any[] } {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGST = 0;

    const calculatedItems = items.map(item => {
      subtotal += item.grossAmount;
      totalDiscount += item.discountAmount;
      taxableAmount += item.taxableAmount;

      const gst = GSTCalculator.calculateGST({
        taxableAmount: item.taxableAmount,
        gstRate: item.gstRate,
        businessState,
        customerState,
      });

      totalCGST += gst.cgstAmount;
      totalSGST += gst.sgstAmount;
      totalIGST += gst.igstAmount;
      totalGST += gst.totalGST;

      return {
        ...item,
        ...gst,
        totalAmount: Number((item.taxableAmount + gst.totalGST).toFixed(2)),
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    totalDiscount = Number(totalDiscount.toFixed(2));
    taxableAmount = Number(taxableAmount.toFixed(2));
    totalCGST = Number(totalCGST.toFixed(2));
    totalSGST = Number(totalSGST.toFixed(2));
    totalIGST = Number(totalIGST.toFixed(2));
    totalGST = Number(totalGST.toFixed(2));

    const grossAmount = Number((taxableAmount + totalGST).toFixed(2));
    
    // TDS is calculated on the taxable amount per business rules specified
    const tds = TDSCalculator.calculateTDS({
      taxableAmount,
      tdsRate,
    });

    const netAmount = Number((grossAmount - tds.tdsAmount).toFixed(2));

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      tdsRate,
      tdsAmount: tds.tdsAmount,
      grossAmount,
      netAmount,
      calculatedItems,
    };
  }

  static getGSTSummary = GSTCalculator.summarizeGST;
}

export * from "./tax-types";
export * from "./gst-calculator";
export * from "./tds-calculator";
