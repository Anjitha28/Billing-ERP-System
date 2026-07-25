import { ProformaInvoiceForm } from "../ProformaInvoiceForm";
import { CustomerService } from "@/services/customer.service";
import { ProductService } from "@/services/product.service";

export default async function NewProformaInvoicePage() {
  const [customers, products] = await Promise.all([
    CustomerService.getCustomers({ isActive: true }),
    ProductService.getProducts({ isActive: true }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Proforma Invoice</h1>
        <p className="text-gray-500 text-sm mt-1">Draft a new quotation for a customer.</p>
      </div>
      
      <ProformaInvoiceForm customers={customers} products={products} />
    </div>
  );
}
