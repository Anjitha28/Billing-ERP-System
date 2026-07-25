import { CustomerForm } from "../CustomerForm";

export default function NewCustomerPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new B2B or B2C customer profile.</p>
      </div>
      
      <CustomerForm />
    </div>
  );
}
