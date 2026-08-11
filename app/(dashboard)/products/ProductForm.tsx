"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Product, ProductType } from "@prisma/client";
import { createProductAction, updateProductAction } from "./actions";

type ProductFormProps = {
  initialData?: any;
};

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<ProductType>(initialData?.type || "PRODUCT");
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    hsnSacCode: initialData?.hsnSacCode || "",
    unit: initialData?.unit || "Piece",
    sellingPrice: initialData ? initialData.sellingPrice.toString() : "",
    customPrice: initialData?.customPrice ? initialData.customPrice.toString() : "",
    purchasePrice: initialData?.purchasePrice ? initialData.purchasePrice.toString() : "",
    gstRate: initialData ? initialData.gstRate.toString() : "18",
    cessRate: initialData?.cessRate ? initialData.cessRate.toString() : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side Validation
    if (!formData.name) return setError("Name is required.");
    if (!formData.hsnSacCode) return setError("HSN/SAC Code is required.");
    if (!formData.unit) return setError("Unit is required.");
    if (!formData.sellingPrice || isNaN(Number(formData.sellingPrice)) || Number(formData.sellingPrice) < 0) {
      return setError("Selling Price must be a valid non-negative number.");
    }
    if (formData.customPrice && (isNaN(Number(formData.customPrice)) || Number(formData.customPrice) < 0)) {
      return setError("Custom Price must be a valid non-negative number.");
    }
    if (formData.purchasePrice && (isNaN(Number(formData.purchasePrice)) || Number(formData.purchasePrice) < 0)) {
      return setError("Purchase Price must be a valid non-negative number.");
    }
    if (!formData.gstRate || isNaN(Number(formData.gstRate))) {
      return setError("GST Rate must be a valid number.");
    }
    if (formData.cessRate && (isNaN(Number(formData.cessRate)) || Number(formData.cessRate) < 0)) {
      return setError("Cess Rate must be a non-negative number.");
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        type,
      };

      let res;
      if (initialData) {
        res = await updateProductAction(initialData.id, payload);
      } else {
        res = await createProductAction(payload as any);
      }

      if (res.success) {
        router.push("/products");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-theme-surface border border-theme-border rounded-xl shadow-sm p-6 space-y-8">
      {error && (
        <div className="bg-red-900/20 text-red-700 p-4 rounded-lg text-sm font-medium border border-red-200">
          {error}
        </div>
      )}

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-theme-text mb-2">Item Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="type" 
              value="PRODUCT" 
              checked={type === "PRODUCT"}
              onChange={() => setType("PRODUCT")}
              className="text-theme-primary focus:ring-theme-primary"
              disabled={!!initialData} // Lock type after creation
            />
            <span className="text-theme-text font-medium">Product</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="radio" 
              name="type" 
              value="SERVICE" 
              checked={type === "SERVICE"}
              onChange={() => setType("SERVICE")}
              className="text-theme-primary focus:ring-theme-primary"
              disabled={!!initialData}
            />
            <span className="text-theme-text font-medium">Service</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info & Classification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-theme-text border-b pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                HSN / SAC Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="hsnSacCode"
                required
                value={formData.hsnSacCode}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
              >
                <option value="Piece">Piece (pcs)</option>
                <option value="Kg">Kilogram (kg)</option>
                <option value="Gram">Gram (g)</option>
                <option value="Litre">Litre (l)</option>
                <option value="Meter">Meter (m)</option>
                <option value="Hour">Hour (hr)</option>
                <option value="Day">Day</option>
                <option value="Month">Month</option>
                <option value="Service">Service</option>
                <option value="Box">Box</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Tax */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-theme-text border-b pb-2">Pricing & Taxation</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Custom/Override Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="customPrice"
                value={formData.customPrice}
                onChange={handleChange}
                placeholder="Optional override price"
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-purple-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Purchase Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                GST Rate (%) <span className="text-red-500">*</span>
              </label>
              <select
                name="gstRate"
                required
                value={formData.gstRate}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary bg-theme-surface"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-text mb-1">
                Cess Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="cessRate"
                value={formData.cessRate}
                onChange={handleChange}
                className="w-full border border-theme-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-theme-text bg-theme-surface border border-theme-border rounded-lg hover:bg-theme-surface-hover focus:outline-none focus:ring-2 focus:ring-theme-primary"
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-theme-primary rounded-lg hover:bg-theme-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary flex items-center gap-2"
        >
          {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
          {initialData ? "Save Changes" : "Create Item"}
        </button>
      </div>
    </form>
  );
}
