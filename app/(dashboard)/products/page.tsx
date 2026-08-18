import Link from "next/link";
import { ProductService } from "@/services/product.service";
import { ProductClientList } from "./ProductClientList";

export const metadata = {
  title: "Products & Services - Billing ERP",
};

export default async function ProductsPage() {
  const products = JSON.parse(JSON.stringify(await ProductService.getProducts()));

  // Calculate Summary Cards
  const totalItems = products.length;
  const activeItems = products.filter((p: any) => p.isActive).length;
  const totalProducts = products.filter((p: any) => p.type === "PRODUCT").length;
  const totalServices = products.filter((p: any) => p.type === "SERVICE").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Products & Services</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Manage products and services used for billing and invoicing.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-theme-primary hover:bg-theme-primary-dark text-white text-sm font-medium rounded-lg transition-colors shadow-sm gap-2"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product / Service
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-theme-text-muted uppercase tracking-wide">Total Items</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{totalItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-emerald-500 uppercase tracking-wide">Active Items</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{activeItems}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-blue-500 uppercase tracking-wide">Products</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{totalProducts}</p>
        </div>
        <div className="bg-theme-surface p-4 rounded-xl shadow-sm border border-theme-border">
          <p className="text-xs font-medium text-purple-500 uppercase tracking-wide">Services</p>
          <p className="mt-2 text-2xl font-bold text-theme-text">{totalServices}</p>
        </div>
      </div>

      <ProductClientList initialProducts={products} />
    </div>
  );
}
