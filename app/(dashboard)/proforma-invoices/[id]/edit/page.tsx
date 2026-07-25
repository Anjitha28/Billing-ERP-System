import { ProformaInvoiceForm } from "../../ProformaInvoiceForm";
import { CustomerService } from "@/services/customer.service";
import { ProductService } from "@/services/product.service";
import { ProformaInvoiceService } from "@/services/proforma-invoice.service";
import { notFound, redirect } from "next/navigation";

export default async function EditProformaInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const [invoice, customers, products] = await Promise.all([
    ProformaInvoiceService.getProformaInvoiceById(id),
    CustomerService.getCustomers({ isActive: true }),
    ProductService.getProducts({ isActive: true }),
  ]);

  if (!invoice) {
    notFound();
  }

  if (invoice.status !== "DRAFT") {
    // Only draft invoices can be edited
    redirect(`/proforma-invoices/${invoice.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Proforma Invoice</h1>
        <p className="text-gray-500 text-sm mt-1">Update draft quotation {invoice.invoiceNumber}.</p>
      </div>
      
      <ProformaInvoiceForm 
        initialData={invoice} 
        customers={customers} 
        products={products} 
      />
    </div>
  );
}
