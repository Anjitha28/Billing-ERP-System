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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit {product.type === "PRODUCT" ? "Product" : "Service"}</h1>
        <p className="text-gray-500 text-sm mt-1">Update information for {product.name}.</p>
      </div>
      
      <ProductForm initialData={product} />
    </div>
  );
}
