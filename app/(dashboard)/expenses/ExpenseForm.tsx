"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TaxEngine, TaxCalculationResult } from "@/lib/tax";
import { BUSINESS_LOCATION } from "@/lib/config/business";
import { createExpenseAction, updateExpenseAction } from "./actions";
import { createVendorAction } from "../vendors/actions";
import { createExpenseCategoryAction } from "./category-actions";

export function ExpenseForm({ 
  initialData, 
  vendors: initialVendors,
  categories: initialCategories,
  products = []
}: { 
  initialData?: any;
  vendors: any[];
  categories: any[];
  products?: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [vendors, setVendors] = useState(initialVendors);
  const [categories, setCategories] = useState(initialCategories);


  const [notes, setNotes] = useState(initialData?.notes || "");
  
  const [items, setItems] = useState<any[]>(
    initialData?.items?.map((item: any) => ({
      productId: item.productId || "",
      vendorId: item.vendorId || "",
      categoryId: item.categoryId || "",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      hsnSacCode: item.hsnSacCode || "",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      gstRate: Number(item.gstRate),
      isCustomGst: ![0, 5, 12, 18, 28].includes(Number(item.gstRate)),
      tdsRate: item.tdsRate?.toString() || "",
      isCustomTds: item.tdsRate !== null && item.tdsRate !== undefined && ![0, 1, 2, 5, 10].includes(Number(item.tdsRate)),
      unit: item.unit || "NOS",
    })) || [{ 
      productId: "", vendorId: "", categoryId: "", 
      date: new Date().toISOString().split('T')[0], hsnSacCode: "", 
      quantity: 1, unitPrice: 0, gstRate: 0, isCustomGst: false, 
      tdsRate: "", isCustomTds: false, unit: "NOS" 
    }]
  );

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleItemVendorChange = async (index: number, value: string) => {
    if (value === "ADD_NEW") {
      const name = window.prompt("Enter new vendor name:");
      if (name?.trim()) {
        const res = await createVendorAction({ name: name.trim() });
        if (res.success && res.data) {
          setVendors([...vendors, res.data]);
          handleItemChange(index, "vendorId", res.data.id);
        } else {
          alert(res.error);
        }
      }
    } else {
      handleItemChange(index, "vendorId", value);
    }
  };

  const handleItemCategoryChange = async (index: number, value: string) => {
    if (value === "ADD_NEW") {
      const name = window.prompt("Enter new category name:");
      if (name?.trim()) {
        const res = await createExpenseCategoryAction({ name: name.trim() });
        if (res.success && res.data) {
          setCategories([...categories, res.data]);
          handleItemChange(index, "categoryId", res.data.id);
        } else {
          alert(res.error);
        }
      }
    } else {
      handleItemChange(index, "categoryId", value);
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const newItems = [...items];
    const selectedProduct = products.find(p => p.id === productId);
    
    if (selectedProduct) {
      const gst = Number(selectedProduct.gstRate || 0);
      newItems[index] = {
        ...newItems[index],
        productId,
        hsnSacCode: selectedProduct.hsnSacCode,
        unitPrice: Number(selectedProduct.purchasePrice || selectedProduct.sellingPrice || 0),
        gstRate: gst,
        isCustomGst: ![0, 5, 12, 18, 28].includes(gst)
      };
    } else {
      newItems[index].productId = "";
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { 
    productId: "", vendorId: "", categoryId: "", 
    date: new Date().toISOString().split('T')[0], hsnSacCode: "", 
    quantity: 1, unitPrice: 0, gstRate: 0, isCustomGst: false, 
    tdsRate: "", isCustomTds: false, unit: "NOS" 
  }]);
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Tax Engine Calculation
  const taxInput = items.map(item => {
    const grossAmount = Number(item.quantity) * Number(item.unitPrice);
    const itemVendor = vendors.find(v => v.id === item.vendorId);
    return {
      taxableAmount: grossAmount,
      gstRate: Number(item.gstRate) || 0,
      grossAmount,
      discountAmount: 0,
      customerState: itemVendor?.state || BUSINESS_LOCATION.state,
      tdsRate: Number(item.tdsRate) || 0
    };
  });

  const calc = TaxEngine.calculateInvoiceTaxes({
    items: taxInput,
    businessState: BUSINESS_LOCATION.state,
    customerState: BUSINESS_LOCATION.state // fallback
  });

  // Calculate top-level isInterState if we want to show a warning, but we removed Vendor from top-level
  // so we can just skip it.

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.some(i => !i.categoryId)) {
      setError("All items must have a category.");
      return;
    }

    // State Validation for Vendors
    const missingStateVendors = items.filter(i => {
      if (!i.vendorId) return false;
      const vendor = vendors.find(v => v.id === i.vendorId);
      return !vendor?.state || vendor.state.trim() === "";
    });

    if (missingStateVendors.length > 0) {
      setError("One or more selected vendors are missing a State. Please update the vendor's profile with a valid State before proceeding. State is required for accurate tax calculation.");
      return;
    }

    const payload = {
      expenseDate: items[0]?.date || new Date().toISOString().split('T')[0],
      vendorId: items[0]?.vendorId || null,
      categoryId: items[0]?.categoryId || null,
      notes,
      
      subtotal: calc.subtotal,
      discountAmount: calc.totalDiscount,
      taxableAmount: calc.taxableAmount,

      inputCGST: calc.totalCGST,
      inputSGST: calc.totalSGST,
      inputIGST: calc.totalIGST,
      totalInputGST: calc.totalGST,

      tdsRate: 0, // Top level TDS rate is 0 since we track it per-item now
      tdsAmount: calc.tdsAmount,
      grossAmount: calc.grossAmount,
      netAmount: calc.netAmount,

      items: items.map((item, i) => ({
        productId: item.productId || null,
        vendorId: item.vendorId || null,
        categoryId: item.categoryId || null,
        date: item.date,
        hsnSacCode: item.hsnSacCode,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        gstRate: item.gstRate,
        taxableAmount: calc.calculatedItems[i].taxableAmount,
        cgstRate: calc.calculatedItems[i].cgstRate,
        cgstAmount: calc.calculatedItems[i].cgstAmount,
        sgstRate: calc.calculatedItems[i].sgstRate,
        sgstAmount: calc.calculatedItems[i].sgstAmount,
        igstRate: calc.calculatedItems[i].igstRate,
        igstAmount: calc.calculatedItems[i].igstAmount,
        totalGST: calc.calculatedItems[i].totalGST,
        tdsRate: Number(item.tdsRate) || 0,
        tdsAmount: calc.calculatedItems[i].tdsAmount || 0,
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
        <div className="p-4 bg-red-900/20 border border-red-200 rounded-lg text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Items List */}
      <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border p-6">
        <h2 className="text-lg font-bold text-theme-text mb-4">Expense Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="border-b-2 border-theme-border text-sm font-medium text-theme-text-muted">
                <th className="pb-3 px-2 w-36 text-xs uppercase tracking-wider">Date</th>
                <th className="pb-3 px-2 w-40 text-xs uppercase tracking-wider">Vendor</th>
                <th className="pb-3 px-2 w-40 text-xs uppercase tracking-wider">Item (Optional)</th>
                <th className="pb-3 px-2 w-40 text-xs uppercase tracking-wider">Category</th>
                <th className="pb-3 px-2 w-28 text-xs uppercase tracking-wider">HSN/SAC</th>
                <th className="pb-3 px-2 w-24 text-right text-xs uppercase tracking-wider">Qty</th>
                <th className="pb-3 px-2 w-28 text-right text-xs uppercase tracking-wider">Rate</th>
                <th className="pb-3 px-2 w-32 text-right text-xs uppercase tracking-wider">GST Rate</th>
                <th className="pb-3 px-2 w-28 text-right text-xs uppercase tracking-wider">TDS</th>
                <th className="pb-3 px-2 w-32 text-right text-xs uppercase tracking-wider">Amount</th>
                <th className="pb-3 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <tr key={index} className="group hover:bg-theme-surface-hover transition-colors">
                  <td className="py-2 px-2">
                    <input
                      type="date"
                      required
                      value={item.date}
                      onChange={e => handleItemChange(index, "date", e.target.value)}
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary text-xs"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={item.vendorId}
                      onChange={e => handleItemVendorChange(index, e.target.value)}
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm bg-theme-surface"
                    >
                      <option value="">No Vendor</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                      <option value="ADD_NEW" className="font-bold text-theme-primary">+ Add Custom Vendor</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      value={item.productId}
                      onChange={e => handleProductChange(index, e.target.value)}
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm bg-theme-surface"
                    >
                      <option value="">Select Item</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <select
                      required
                      value={item.categoryId}
                      onChange={e => handleItemCategoryChange(index, e.target.value)}
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm bg-theme-surface"
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="ADD_NEW" className="font-bold text-theme-primary">+ Add Custom Category</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={item.hsnSacCode}
                      onChange={e => handleItemChange(index, "hsnSacCode", e.target.value)}
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm"
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
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm text-right"
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
                      className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm text-right"
                    />
                  </td>
                  <td className="py-2 px-2">
                    {!item.isCustomGst ? (
                      <select
                        value={item.gstRate}
                        onChange={e => {
                          if (e.target.value === "CUSTOM") {
                            handleItemChange(index, "isCustomGst", true);
                            handleItemChange(index, "gstRate", 0);
                          } else {
                            handleItemChange(index, "gstRate", e.target.value);
                          }
                        }}
                        className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary sm:text-sm text-right bg-theme-surface"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center w-full border border-theme-border rounded focus-within:ring-1 focus-within:ring-theme-primary focus-within:border-theme-primary bg-theme-surface">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            required
                            value={item.gstRate}
                            onChange={e => handleItemChange(index, "gstRate", e.target.value)}
                            className="w-full border-none focus:ring-0 bg-transparent sm:text-sm text-right px-1 py-1.5"
                            style={{ boxShadow: 'none' }}
                          />
                          <span className="text-theme-text-muted pr-2 text-sm font-medium">%</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            handleItemChange(index, "isCustomGst", false);
                            handleItemChange(index, "gstRate", 0);
                          }}
                          className="text-theme-text-muted hover:text-theme-text"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {!item.isCustomTds ? (
                      <select
                        value={item.tdsRate}
                        onChange={e => {
                          if (e.target.value === "CUSTOM") {
                            handleItemChange(index, "isCustomTds", true);
                            handleItemChange(index, "tdsRate", "");
                          } else {
                            handleItemChange(index, "tdsRate", e.target.value);
                          }
                        }}
                        className="w-full border-theme-border rounded focus:ring-theme-primary focus:border-theme-primary text-xs text-right bg-theme-surface"
                      >
                        <option value="">No TDS</option>
                        <option value="1">1%</option>
                        <option value="2">2%</option>
                        <option value="5">5%</option>
                        <option value="10">10%</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="flex items-center w-full border border-theme-border rounded focus-within:ring-1 focus-within:ring-theme-primary focus-within:border-theme-primary bg-theme-surface">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            required
                            value={item.tdsRate}
                            onChange={e => handleItemChange(index, "tdsRate", e.target.value)}
                            className="w-full border-none focus:ring-0 bg-transparent text-xs text-right px-1 py-1.5"
                            style={{ boxShadow: 'none' }}
                          />
                          <span className="text-theme-text-muted pr-2 text-xs font-medium">%</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            handleItemChange(index, "isCustomTds", false);
                            handleItemChange(index, "tdsRate", "");
                          }}
                          className="text-theme-text-muted hover:text-theme-text"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-theme-text">
                    ₹{calc.calculatedItems[index].totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right">
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
          className="mt-4 px-4 py-2 border border-theme-border rounded-lg text-sm font-medium text-theme-text hover:bg-theme-surface-hover flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Another Item
        </button>
      </div>

      {/* Calculations & Submit */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div className="bg-theme-surface rounded-xl shadow-sm border border-theme-border p-6">
            <h2 className="text-lg font-bold text-theme-text mb-4">Additional Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-text mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-theme-border rounded-lg px-4 py-2 focus:ring-theme-primary focus:border-theme-primary"
                  placeholder="Internal notes regarding this expense..."
                />
              </div>
              {/* Removed old TDS field from here */}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-theme-surface rounded-xl shadow-sm border border-theme-border overflow-hidden flex flex-col">
          <div className="p-6 border-b border-theme-border bg-theme-surface-hover flex-1">
            <h2 className="text-lg font-bold text-theme-text mb-4">Expense Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-theme-text-muted">
                <span>Subtotal</span>
                <span>₹{calc.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-theme-text font-medium pt-2 border-t border-theme-border">
                <span>Taxable Amount</span>
                <span>₹{calc.taxableAmount.toFixed(2)}</span>
              </div>

              {calc.totalGST > 0 && (
                <div className="pt-2 pb-2 space-y-2">
                  <div className="flex justify-between text-theme-text-muted text-xs">
                    <span>Input CGST</span>
                    <span>₹{calc.totalCGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-theme-text-muted text-xs">
                    <span>Input SGST</span>
                    <span>₹{calc.totalSGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-theme-text-muted text-xs">
                    <span>Input IGST</span>
                    <span>₹{calc.totalIGST.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-theme-text font-bold pt-2 border-t border-theme-border">
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

          <div className="p-6 bg-theme-bg text-white">
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium">Net Amount Payable</span>
              <span className="text-2xl font-bold text-emerald-400">₹{calc.netAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg text-sm font-medium hover:bg-theme-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-theme-primary text-white rounded-lg text-sm font-medium hover:bg-theme-primary-dark transition-colors disabled:opacity-50"
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
