"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Product, ProductType } from "@prisma/client";
import { toggleProductStatusAction } from "./actions";

export function ProductClientList({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isPending, startTransition] = useTransition();

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ACTIVE");

  const filteredProducts = products.filter((product) => {
    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      product.hsnSacCode.toLowerCase().includes(searchLower);

    // Type Filter
    const matchesType = typeFilter === "ALL" || product.type === typeFilter;

    // Status Filter
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && product.isActive) ||
      (statusFilter === "INACTIVE" && !product.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleStatus = (id: string, currentlyActive: boolean) => {
    startTransition(async () => {
      // Optimistic update
      setProducts(prev => 
        prev.map(p => p.id === id ? { ...p, isActive: !currentlyActive } : p)
      );

      const res = await toggleProductStatusAction(id, currentlyActive);
      
      if (!res.success) {
        // Revert on failure
        setProducts(prev => 
          prev.map(p => p.id === id ? { ...p, isActive: currentlyActive } : p)
        );
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by Name or HSN/SAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Types</option>
          <option value="PRODUCT">Products</option>
          <option value="SERVICE">Services</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="INACTIVE">Inactive Only</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">HSN/SAC</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-right">GST</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No products or services found. Add your first item to start billing.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${!product.isActive ? 'bg-gray-50/50 opacity-75' : ''}`}>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.type === 'PRODUCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.hsnSacCode}</td>
                    <td className="px-6 py-4 text-right">
                      ₹{product.sellingPrice.toString()} <span className="text-gray-400 text-xs">/ {product.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">{product.gstRate.toString()}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/products/${product.id}/edit`}
                          className="text-gray-500 hover:text-blue-600 font-medium text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product.id, product.isActive)}
                          disabled={isPending}
                          className={`font-medium text-xs ${product.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
