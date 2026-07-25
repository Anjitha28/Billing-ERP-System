import { TDSResult } from "./tax-types";

export const TDS_RATES = [
  {
    code: "None",
    description: "No TDS",
    rate: 0,
  },
  {
    code: "194C",
    description: "Payments to Contractors",
    rate: 1, // simplified to 1%, ideally configurable based on entity
  },
  {
    code: "194J",
    description: "Professional Services",
    rate: 10,
  },
];

type CalculateTDSArgs = {
  taxableAmount: number;
  tdsRate: number;
};

export class TDSCalculator {
  static calculateTDS({ taxableAmount, tdsRate }: CalculateTDSArgs): TDSResult {
    const tdsAmount = Number(((taxableAmount * tdsRate) / 100).toFixed(2));
    const netPayableAmount = Number((taxableAmount - tdsAmount).toFixed(2)); // Generally TDS is subtracted from Gross, but we'll return components

    return {
      taxableAmount,
      tdsRate,
      tdsAmount,
      netPayableAmount,
    };
  }
}
