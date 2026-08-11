import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-theme-text">Add Product or Service</h1>
        <p className="text-theme-text-muted text-sm mt-1">Create a new item for billing and invoicing.</p>
      </div>
      
      <ProductForm />
    </div>
  );
}
