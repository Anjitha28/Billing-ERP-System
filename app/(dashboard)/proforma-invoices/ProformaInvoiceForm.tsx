"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createProformaInvoiceAction, updateProformaInvoiceAction } from "../invoices/proforma-actions";
import { TaxEngine, TDS_RATES } from "@/lib/tax";
import { BUSINESS_LOCATION } from "@/lib/config/business";

type FormProps = {
  initialData?: any;
  customers: any[];
  products: any[];
};

export function ProformaInvoiceForm({ initialData, customers, products }: FormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [invoiceDate, setInvoiceDate] = useState(
    initialData?.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState(
    initialData?.validUntil ? new Date(initialData.validUntil).toISOString().split('T')[0] : ""
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  
  // New TDS State
  const [tdsRate, setTdsRate] = useState<number>(initialData?.tdsRate ? Number(initialData.tdsRate) : 0);

  // Items State
  const [items, setItems] = useState<any[]>(
    initialData?.items?.map((i: any) => ({
      id: Math.random().toString(), // temporary UI id
      productId: i.productId,
      description: i.description || "",
      quantity: Number(i.quantity),
      unit: i.unit,
      unitPrice: Number(i.unitPrice),
      discountPercent: Number(i.discountPercent),
      gstRate: Number(i.gstRate),
    })) || []
  );

  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === customerId);
  }, [customerId, customers]);

  // Live Calculations utilizing the unified TaxEngine
  const calculationResult = useMemo(() => {
    const mappedItems = items.map(item => {
      const grossAmount = Number((item.quantity * item.unitPrice).toFixed(2));
      const discountAmount = Number(((grossAmount * item.discountPercent) / 100).toFixed(2));
      const taxableAmount = Number((grossAmount - discountAmount).toFixed(2));

      return {
        ...item,
        grossAmount,
        discountAmount,
        taxableAmount,
      };
    });

    return TaxEngine.calculateInvoiceTaxes({
      items: mappedItems,
      businessState: BUSINESS_LOCATION.state,
      customerState: selectedCustomer?.state || BUSINESS_LOCATION.state,
      tdsRate,
    });
  }, [items, selectedCustomer, tdsRate]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        productId: "",
        description: "",
        quantity: 1,
        unit: "Piece",
        unitPrice: 0,
        discountPercent: 0,
        gstRate: 0,
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Auto-fill defaults when product is selected
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.description = product.description || "";
            updated.unit = product.unit;
            updated.unitPrice = Number(product.customPrice || product.sellingPrice);
            updated.gstRate = Number(product.gstRate);
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!customerId) return setError("Please select a customer.");
    if (!invoiceDate) return setError("Invoice Date is required.");
    if (items.length === 0) return setError("At least one item is required.");
    
    for (const item of items) {
      if (!item.productId) return setError("Please select a product for all items.");
      if (item.quantity <= 0) return setError("Quantity must be greater than 0.");
      if (item.unitPrice < 0) return setError("Unit price cannot be negative.");
      if (item.discountPercent < 0 || item.discountPercent > 100) return setError("Discount must be between 0 and 100.");
    }

    startTransition(async () => {
      const payload = {
        customerId,
        invoiceDate,
        validUntil: validUntil || null,
        notes,
        tdsRate,
        items: items.map(i => ({
          productId: i.productId,
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitPrice: Number(i.unitPrice),
          discountPercent: Number(i.discountPercent),
          gstRate: Number(i.gstRate),
        }))
      };

      let res;
      if (initialData) {
        res = await updateProformaInvoiceAction(initialData.id, payload);
      } else {
        res = await createProformaInvoiceAction(payload);
      }

      if (res.success) {
        router.push("/proforma-invoices");
      } else {
        setError(res.error);
      }
    });
  };

  const isIntraState = !selectedCustomer || (selectedCustomer.state?.toLowerCase().trim() === BUSINESS_LOCATION.state.toLowerCase().trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {error && (
        <div className="bg-red-900/20 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Primary Details */}
      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <h3 className="text-lg font-semibold text-theme-text border-b pb-2 mb-4">Invoice Details</h3>
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Customer <span className="text-red-500">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
          >
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.legalName} {c.gstin ? `(${c.gstin})` : ''} - {c.state || "State missing"}
              </option>
            ))}
          </select>
          {selectedCustomer && (
            <p className="text-xs text-theme-text-muted mt-1">
              Business: {BUSINESS_LOCATION.state} | Customer: {selectedCustomer.state || "Unknown"}
              <span className={`ml-2 font-medium ${isIntraState ? 'text-theme-primary' : 'text-purple-600'}`}>
                ({isIntraState ? 'Intra-State: CGST/SGST' : 'Inter-State: IGST'})
              </span>
            </p>
          )}
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Invoice Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-200 mb-1">
            Valid Until
          </label>
          <input
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-theme-surface-hover border-b border-theme-border flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text">Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-sm font-medium text-theme-primary hover:text-theme-primary-dark flex items-center gap-1"
          >
            <span>+</span> Add Item
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-theme-surface-hover text-xs uppercase text-theme-text-muted font-semibold">
                <th className="px-4 py-3 min-w-[200px]">Product/Service</th>
                <th className="px-4 py-3 w-24">Qty</th>
                <th className="px-4 py-3 w-32">Price (₹)</th>
                <th className="px-4 py-3 w-24">Disc (%)</th>
                <th className="px-4 py-3 w-24">GST (%)</th>
                <th className="px-4 py-3 text-right w-32">Amount (₹)</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {items.map((item, index) => {
                const calc = calculationResult.calculatedItems[index];
                return (
                  <tr key={item.id} className="bg-theme-surface">
                    <td className="px-4 py-3">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                        required
                        className="w-full border border-theme-border rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-theme-primary"
                      >
                        <option value="">Select...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.customPrice ? '(Custom Price)' : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        className="w-full border border-theme-border rounded-md px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                        className="w-full border border-theme-border rounded-md px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discountPercent}
                        onChange={(e) => handleItemChange(item.id, 'discountPercent', e.target.value)}
                        className="w-full border border-theme-border rounded-md px-2 py-1.5 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="px-2 py-1.5 text-sm text-theme-text-muted bg-theme-surface-hover border border-theme-border rounded-md text-center">
                        {item.gstRate}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-theme-text">
                      {calc?.totalAmount?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="text-center py-8 text-sm text-theme-text-muted">
              No items added. Click "Add Item" to start.
            </div>
          )}
        </div>
      </div>

      {/* Footer and Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-theme-text mb-3">Optional Deductions</h3>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-1">
                TDS Application
              </label>
              <select
                value={tdsRate}
                onChange={(e) => setTdsRate(Number(e.target.value))}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
              >
                {TDS_RATES.map(rate => (
                  <option key={rate.code} value={rate.rate}>
                    {rate.description} {rate.rate > 0 ? `(${rate.rate}%)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Notes / Terms
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              placeholder="Add any additional notes for the customer..."
            />
          </div>
        </div>
        
        <div className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-theme-text border-b pb-2 mb-4">Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-theme-text-muted">
              <span>Subtotal</span>
              <span>₹{calculationResult.subtotal.toFixed(2)}</span>
            </div>
            {calculationResult.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>-₹{calculationResult.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-theme-text-muted">
              <span>Taxable Amount</span>
              <span>₹{calculationResult.taxableAmount.toFixed(2)}</span>
            </div>
            
            {/* Dynamic GST Display based on Intra/Inter State */}
            {isIntraState ? (
              <>
                <div className="flex justify-between text-theme-text-muted pl-4 text-xs">
                  <span>CGST</span>
                  <span>₹{calculationResult.totalCGST.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-theme-text-muted pl-4 text-xs border-b border-theme-border pb-2">
                  <span>SGST</span>
                  <span>₹{calculationResult.totalSGST.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-theme-text-muted pl-4 text-xs border-b border-theme-border pb-2">
                <span>IGST</span>
                <span>₹{calculationResult.totalIGST.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between font-medium text-theme-text">
              <span>Gross Amount</span>
              <span>₹{calculationResult.grossAmount.toFixed(2)}</span>
            </div>

            {calculationResult.tdsAmount > 0 && (
              <div className="flex justify-between text-red-600 font-medium pt-2 border-t border-theme-border">
                <span>Less: TDS ({calculationResult.tdsRate}%)</span>
                <span>-₹{calculationResult.tdsAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-theme-border flex justify-between items-center">
              <span className="text-base font-bold text-theme-text">
                {calculationResult.tdsAmount > 0 ? "Net Amount" : "Grand Total"}
              </span>
              <span className="text-2xl font-bold text-theme-primary">₹{calculationResult.netAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 right-0 left-64 p-4 bg-theme-surface border-t border-theme-border flex justify-end gap-3 z-10 shadow-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-200 bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-surface-hover focus:outline-none focus:ring-2 focus:ring-theme-primary"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || items.length === 0}
          className="px-4 py-2 text-sm font-medium text-white bg-theme-primary rounded-lg hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {initialData ? "Save Changes" : "Create Draft"}
        </button>
      </div>
    </form>
  );
}
