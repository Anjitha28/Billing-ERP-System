import { ProductService } from "@/services/product.service";
import { notFound } from "next/navigation";
import { ProductForm } from "../../ProductForm";

export default async function EditProductPage({
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

  const plainProduct = {
    ...product,
    sellingPrice: product.sellingPrice.toString(),
    customPrice: product.customPrice?.toString() || null,
    purchasePrice: product.purchasePrice?.toString() || null,
    gstRate: product.gstRate.toString(),
    cessRate: product.cessRate?.toString() || null,
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Edit {product.type === "PRODUCT" ? "Product" : "Service"}</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Update information for {product.name}.</p>
        </div>
      </div>
      
      <ProductForm initialData={plainProduct} />
    </div>
  );
}
