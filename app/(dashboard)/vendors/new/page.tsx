import { VendorForm } from "../VendorForm";

export default function NewVendorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Vendor</h1>
        <p className="text-gray-500 text-sm mt-1">Register a new supplier or service provider.</p>
      </div>

      <VendorForm />
    </div>
  );
}
