"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaxEngine, TaxCalculationResult } from "@/lib/tax";
import { BUSINESS_LOCATION } from "@/lib/config/business";
import { createExpenseAction, updateExpenseAction } from "./actions";

export function ExpenseForm({ 
  initialData, 
  vendors,
  categories
}: { 
  initialData?: any;
  vendors: any[];
  categories: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [vendorId, setVendorId] = useState(initialData?.vendorId || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expenseDate ? new Date(initialData.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [tdsRate, setTdsRate] = useState(initialData?.tdsRate?.toString() || "");

  const [items, setItems] = useState<any[]>(
    initialData?.items?.map((item: any) => ({
      description: item.description,
      hsnSacCode: item.hsnSacCode || "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      gstRate: Number(item.gstRate),
      unit: item.unit || "NOS",
    })) || [{ description: "", hsnSacCode: "", quantity: 1, unitPrice: 0, gstRate: 0, unit: "NOS" }]
  );

  const selectedVendor = vendors.find(v => v.id === vendorId);
  const isInterState = selectedVendor?.state && selectedVendor.state.toLowerCase() !== BUSINESS_LOCATION.state.toLowerCase();

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { description: "", hsnSacCode: "", quantity: 1, unitPrice: 0, gstRate: 0, unit: "NOS" }]);
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Tax Engine Calculation
  const taxInput = items.map(item => {
    const grossAmount = Number(item.quantity) * Number(item.unitPrice);
    return {
      taxableAmount: grossAmount, // Assuming no item level discount for now
      gstRate: Number(item.gstRate),
      grossAmount,
      discountAmount: 0
    };
  });

  const calc = TaxEngine.calculateInvoiceTaxes({
    items: taxInput,
    businessState: BUSINESS_LOCATION.state,
    customerState: selectedVendor?.state || BUSINESS_LOCATION.state,
    tdsRate: Number(tdsRate) || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Expense Category is required.");
      return;
    }

    if (items.some(i => !i.description)) {
      setError("All items must have a description.");
      return;
    }

    const payload = {
      expenseDate,
      description,
      vendorId: vendorId || null,
      categoryId,
      notes,
      
      subtotal: calc.subtotal,
      discountAmount: calc.totalDiscount,
      taxableAmount: calc.taxableAmount,

      inputCGST: calc.totalCGST,
      inputSGST: calc.totalSGST,
      inputIGST: calc.totalIGST,
      totalInputGST: calc.totalGST,

      tdsRate: Number(tdsRate) || 0,
      tdsAmount: calc.tdsAmount,
      grossAmount: calc.grossAmount,
      netAmount: calc.netAmount,

      items: items.map((item, i) => ({
        ...item,
        taxableAmount: calc.calculatedItems[i].taxableAmount,
        cgstRate: calc.calculatedItems[i].cgstRate,
        cgstAmount: calc.calculatedItems[i].cgstAmount,
        sgstRate: calc.calculatedItems[i].sgstRate,
        sgstAmount: calc.calculatedItems[i].sgstAmount,
        igstRate: calc.calculatedItems[i].igstRate,
        igstAmount: calc.calculatedItems[i].igstAmount,
        totalGST: calc.calculatedItems[i].totalGST,
        totalAmount: calc.calculatedItems[i].totalAmount
      }))
    };

    startTransition(async () => {
      const res = initialData 
        ? await updateExpenseAction(initialData.id, payload)
        : await createExpenseAction(payload);
      
      if (res.success) {
        router.push(initialData ? `/expenses/${initialData.id}` : "/expenses");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Main Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Monthly Office Rent"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <a href="/expenses?tab=categories" className="text-xs text-blue-600 hover:underline">Manage Categories</a>
            </div>
            <select
              required
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expense Date *</label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
            <select
              value={vendorId}
              onChange={e => setVendorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">No Vendor Specified</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>{v.name} {v.gstin ? `(${v.gstin})` : ''}</option>
              ))}
            </select>
            {isInterState && (
              <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Vendor is out of state. IGST rules will apply.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-gray-200 text-sm font-medium text-gray-600">
                <th className="pb-3 w-1/3">Description</th>
                <th className="pb-3 w-24">HSN/SAC</th>
                <th className="pb-3 w-20 text-right">Qty</th>
                <th className="pb-3 w-32 text-right">Rate</th>
                <th className="pb-3 w-24 text-right">GST Rate</th>
                <th className="pb-3 w-32 text-right">Amount</th>
                <th className="pb-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={index} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={e => handleItemChange(index, "description", e.target.value)}
                      placeholder="Item description"
                      className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.hsnSacCode}
                      onChange={e => handleItemChange(index, "hsnSacCode", e.target.value)}
                      className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={item.quantity}
                      onChange={e => handleItemChange(index, "quantity", e.target.value)}
                      className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={item.unitPrice}
                      onChange={e => handleItemChange(index, "unitPrice", e.target.value)}
                      className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={item.gstRate}
                      onChange={e => handleItemChange(index, "gstRate", e.target.value)}
                      className="w-full border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right bg-white"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </td>
                  <td className="py-2 pl-2 text-right font-medium text-gray-900">
                    ₹{calc.calculatedItems[index].totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Another Item
        </button>
      </div>

      {/* Calculations & Submit */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Internal notes regarding this expense..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TDS Rate (%)</label>
                <select
                  value={tdsRate}
                  onChange={e => setTdsRate(e.target.value)}
                  className="w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">No TDS</option>
                  <option value="1">1% (Sec 194C)</option>
                  <option value="2">2% (Sec 194C / 194J)</option>
                  <option value="5">5%</option>
                  <option value="10">10% (Sec 194J)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Expense Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{calc.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-800 font-medium pt-2 border-t border-gray-200">
                <span>Taxable Amount</span>
                <span>₹{calc.taxableAmount.toFixed(2)}</span>
              </div>

              {calc.totalGST > 0 && (
                <div className="pt-2 pb-2 space-y-2">
                  {isInterState ? (
                    <div className="flex justify-between text-gray-600 text-xs">
                      <span>Input IGST</span>
                      <span>₹{calc.totalIGST.toFixed(2)}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>Input CGST</span>
                        <span>₹{calc.totalCGST.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs">
                        <span>Input SGST</span>
                        <span>₹{calc.totalSGST.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                <span>Gross Amount</span>
                <span>₹{calc.grossAmount.toFixed(2)}</span>
              </div>

              {calc.tdsAmount > 0 && (
                <div className="flex justify-between text-red-600 font-medium">
                  <span>Less: TDS deduction</span>
                  <span>-₹{calc.tdsAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-900 text-white">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">Net Amount Payable</span>
              <span className="text-2xl font-bold text-emerald-400">₹{calc.netAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : initialData ? "Save Draft" : "Record Expense"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
