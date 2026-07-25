import { ProductService } from "@/services/product.service";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const product = await ProductService.getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.type === 'PRODUCT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
              {product.type}
            </span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {product.isActive ? "Active" : "Inactive"}
            </span>
            <span className="text-gray-500">
              Added on {new Date(product.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/products/${product.id}/edit`}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit Item
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Item Details</h3>
            
            {product.description && (
              <div className="mb-6">
                <span className="block text-gray-500 mb-1 text-sm">Description</span>
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-6 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">HSN / SAC Code</span>
                <span className="text-gray-900 font-medium">{product.hsnSacCode}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Unit of Measurement</span>
                <span className="text-gray-900 font-medium">{product.unit}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Selling Price</span>
                <span className="text-gray-900 font-medium text-lg">₹{product.sellingPrice.toString()}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Purchase Price</span>
                <span className="text-gray-900 font-medium">{product.purchasePrice ? `₹${product.purchasePrice.toString()}` : "-"}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">GST Rate</span>
                <span className="text-gray-900 font-medium">{product.gstRate.toString()}%</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Cess Rate</span>
                <span className="text-gray-900 font-medium">{product.cessRate ? `${product.cessRate.toString()}%` : "-"}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400">
              <span>Created: {new Date(product.createdAt).toLocaleString()}</span>
              <span>Last Updated: {new Date(product.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-gray-500 text-sm font-medium mb-2">Total Sales</h4>
            <span className="text-3xl font-bold text-gray-900">0</span>
            <p className="text-xs text-gray-400 mt-2">Sales tracking will be available in Phase 8</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center h-48">
            <h4 className="text-gray-500 text-sm font-medium mb-2">Revenue Generated</h4>
            <span className="text-3xl font-bold text-gray-900">₹0.00</span>
            <p className="text-xs text-gray-400 mt-2">Revenue ledger will be available in Phase 8</p>
          </div>
        </div>
      </div>
    </div>
  );
}
