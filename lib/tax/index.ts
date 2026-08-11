import { GSTCalculator } from "./gst-calculator";
import { TDSCalculator } from "./tds-calculator";
import { TaxCalculationResult } from "./tax-types";

type CalculateInvoiceTaxArgs = {
  items: {
    taxableAmount: number;
    gstRate: number;
    grossAmount: number;
    discountAmount: number;
    customerState?: string;
    isGstEnabled?: boolean;
    isTdsEnabled?: boolean;
    isIgstEnabled?: boolean;
    tdsRate?: number;
    igstRate?: number;
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
    let totalTdsAmount = 0;

    const calculatedItems = items.map(item => {
      subtotal += item.grossAmount;
      totalDiscount += item.discountAmount;
      taxableAmount += item.taxableAmount;

      const gst = GSTCalculator.calculateGST({
        taxableAmount: item.taxableAmount,
        gstRate: item.gstRate,
        businessState,
        customerState: item.customerState || customerState,
        isGstEnabled: item.isGstEnabled,
        isIgstEnabled: item.isIgstEnabled,
        igstRate: item.igstRate,
      });

      totalCGST += gst.cgstAmount;
      totalSGST += gst.sgstAmount;
      totalIGST += gst.igstAmount;
      totalGST += gst.totalGST;

      const itemTdsRate = item.tdsRate !== undefined ? item.tdsRate : tdsRate;
      const isTdsEnabled = item.isTdsEnabled !== undefined ? item.isTdsEnabled : true;
      let itemTdsAmount = 0;
      if (isTdsEnabled && itemTdsRate > 0) {
        const tds = TDSCalculator.calculateTDS({
          taxableAmount: item.taxableAmount,
          tdsRate: itemTdsRate,
        });
        itemTdsAmount = tds.tdsAmount;
      }
      totalTdsAmount += itemTdsAmount;

      return {
        ...item,
        ...gst,
        tdsRate: itemTdsRate,
        tdsAmount: itemTdsAmount,
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
    totalTdsAmount = Number(totalTdsAmount.toFixed(2));

    const grossAmount = Number((taxableAmount + totalGST).toFixed(2));
    
    const netAmount = Number((grossAmount - totalTdsAmount).toFixed(2));

    return {
      subtotal,
      totalDiscount,
      taxableAmount,
      totalCGST,
      totalSGST,
      totalIGST,
      totalGST,
      tdsRate,
      tdsAmount: totalTdsAmount,
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
