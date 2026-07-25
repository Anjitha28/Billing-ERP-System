import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Product or Service</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new item for billing and invoicing.</p>
      </div>
      
      <ProductForm />
    </div>
  );
}
