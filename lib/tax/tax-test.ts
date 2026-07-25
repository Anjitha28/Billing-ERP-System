import { TaxEngine } from "./index";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("❌ FAILED: " + message);
    process.exit(1);
  }
}

console.log("Running Tax Engine Tests...\n");

// Test 1: Intra-State 18%
const test1 = TaxEngine.calculateInvoiceTaxes({
  items: [{ taxableAmount: 10000, gstRate: 18, grossAmount: 10000, discountAmount: 0 }],
  businessState: "Kerala",
  customerState: "Kerala",
});

assert(test1.totalCGST === 900, "Test 1 CGST should be 900");
assert(test1.totalSGST === 900, "Test 1 SGST should be 900");
assert(test1.totalIGST === 0, "Test 1 IGST should be 0");
assert(test1.totalGST === 1800, "Test 1 Total GST should be 1800");
console.log("✅ Test 1 Passed (Intra-State 18%)");

// Test 2: Inter-State 18%
const test2 = TaxEngine.calculateInvoiceTaxes({
  items: [{ taxableAmount: 10000, gstRate: 18, grossAmount: 10000, discountAmount: 0 }],
  businessState: "Kerala",
  customerState: "Tamil Nadu",
});

assert(test2.totalCGST === 0, "Test 2 CGST should be 0");
assert(test2.totalSGST === 0, "Test 2 SGST should be 0");
assert(test2.totalIGST === 1800, "Test 2 IGST should be 1800");
assert(test2.totalGST === 1800, "Test 2 Total GST should be 1800");
console.log("✅ Test 2 Passed (Inter-State 18%)");

// Test 3: Intra-State 5%
const test3 = TaxEngine.calculateInvoiceTaxes({
  items: [{ taxableAmount: 5000, gstRate: 5, grossAmount: 5000, discountAmount: 0 }],
  businessState: "Kerala",
  customerState: "Kerala",
});

assert(test3.totalCGST === 125, "Test 3 CGST should be 125");
assert(test3.totalSGST === 125, "Test 3 SGST should be 125");
assert(test3.totalGST === 250, "Test 3 Total GST should be 250");
console.log("✅ Test 3 Passed (Intra-State 5%)");

// Test 4: Multiple GST Rates
const test4 = TaxEngine.calculateInvoiceTaxes({
  items: [
    { taxableAmount: 10000, gstRate: 18, grossAmount: 10000, discountAmount: 0 },
    { taxableAmount: 5000, gstRate: 5, grossAmount: 5000, discountAmount: 0 },
  ],
  businessState: "Kerala",
  customerState: "Kerala",
});

assert(test4.taxableAmount === 15000, "Test 4 Taxable Amount should be 15000");
assert(test4.totalCGST === 1025, "Test 4 CGST should be 1025 (900 + 125)");
assert(test4.totalSGST === 1025, "Test 4 SGST should be 1025 (900 + 125)");
assert(test4.totalGST === 2050, "Test 4 Total GST should be 2050");

const summary4 = TaxEngine.getGSTSummary(test4.calculatedItems);
assert(summary4.length === 2, "Test 4 Summary should have 2 groups");
assert(summary4[0].gstRate === 5 && summary4[0].totalTax === 250, "Test 4 Summary 5% group");
assert(summary4[1].gstRate === 18 && summary4[1].totalTax === 1800, "Test 4 Summary 18% group");
console.log("✅ Test 4 Passed (Multiple GST Rates)");

// Test 5: TDS
const test5 = TaxEngine.calculateInvoiceTaxes({
  items: [{ taxableAmount: 10000, gstRate: 18, grossAmount: 10000, discountAmount: 0 }],
  businessState: "Kerala",
  customerState: "Kerala",
  tdsRate: 10,
});

assert(test5.tdsAmount === 1000, "Test 5 TDS should be 1000");
assert(test5.grossAmount === 11800, "Test 5 Gross Amount should be 11800");
assert(test5.netAmount === 10800, "Test 5 Net Amount should be 10800");
console.log("✅ Test 5 Passed (TDS calculation)");

console.log("\nAll tests passed successfully! 🎉");
