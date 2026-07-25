import { GSTResult, GSTSummaryGroup } from "./tax-types";

type CalculateGSTArgs = {
  taxableAmount: number;
  gstRate: number;
  businessState: string;
  customerState: string;
};

export class GSTCalculator {
  static calculateGST({
    taxableAmount,
    gstRate,
    businessState,
    customerState,
  }: CalculateGSTArgs): GSTResult {
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
