import { GSTResult, GSTSummaryGroup } from "./tax-types";

type CalculateGSTArgs = {
  taxableAmount: number;
  gstRate: number;
  businessState: string;
  customerState: string;
  isGstEnabled?: boolean;
  isIgstEnabled?: boolean;
  igstRate?: number;
};

export class GSTCalculator {
  static calculateGST({
    taxableAmount,
    gstRate,
    businessState,
    customerState,
    isGstEnabled = true,
    isIgstEnabled = false,
    igstRate: explicitIgstRate = 0,
  }: CalculateGSTArgs): GSTResult {
    if (!isGstEnabled && !isIgstEnabled) {
      return {
        taxableAmount,
        gstRate: 0, cgstRate: 0, cgstAmount: 0, sgstRate: 0, sgstAmount: 0, igstRate: 0, igstAmount: 0, totalGST: 0
      };
    }

    if (isIgstEnabled) {
      const igstAmount = Number(((taxableAmount * explicitIgstRate) / 100).toFixed(2));
      const totalGST = igstAmount;
      return {
        taxableAmount,
        gstRate: 0, cgstRate: 0, cgstAmount: 0, sgstRate: 0, sgstAmount: 0, igstRate: explicitIgstRate, igstAmount, totalGST
      };
    }

    // Default auto-calculation if standard GST is enabled but IGST is not explicitly overridden
    const isIntraState = businessState.toLowerCase().trim() === customerState.toLowerCase().trim();
    
    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    const totalGST = Number(((taxableAmount * gstRate) / 100).toFixed(2));

    if (isIntraState) {
      cgstRate = gstRate / 2;
      sgstRate = gstRate / 2;
      cgstAmount = Number((totalGST / 2).toFixed(2));
      sgstAmount = Number((totalGST / 2).toFixed(2));
    } else {
      igstRate = gstRate;
      igstAmount = totalGST;
    }

    return {
      taxableAmount,
      gstRate,
      cgstRate,
      cgstAmount,
      sgstRate,
      sgstAmount,
      igstRate,
      igstAmount,
      totalGST,
    };
  }

  static summarizeGST(items: { gstRate: number; taxableAmount: number; cgstAmount: number; sgstAmount: number; igstAmount: number; totalGST: number; }[]): GSTSummaryGroup[] {
    const map = new Map<number, GSTSummaryGroup>();

    for (const item of items) {
      if (!map.has(item.gstRate)) {
        map.set(item.gstRate, {
          gstRate: item.gstRate,
          taxableAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalTax: 0,
        });
      }

      const group = map.get(item.gstRate)!;
      group.taxableAmount = Number((group.taxableAmount + item.taxableAmount).toFixed(2));
      group.cgstAmount = Number((group.cgstAmount + item.cgstAmount).toFixed(2));
      group.sgstAmount = Number((group.sgstAmount + item.sgstAmount).toFixed(2));
      group.igstAmount = Number((group.igstAmount + item.igstAmount).toFixed(2));
      group.totalTax = Number((group.totalTax + item.totalGST).toFixed(2));
    }

    return Array.from(map.values()).sort((a, b) => a.gstRate - b.gstRate);
  }
}
