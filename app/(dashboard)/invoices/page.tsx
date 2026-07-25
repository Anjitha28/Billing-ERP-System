import { requireAdmin } from '@/lib/auth-utils';
import Link from 'next/link';

export default async function InvoicesHubPage() {
  await requireAdmin();

  const invoiceModules = [
    {
      id: 'proforma',
      title: 'Proforma Invoices',
      description: 'Create and manage draft estimates and quotes for customers. These are non-binding and do not affect financial ledgers.',
      href: '/proforma-invoices',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'confirmed',
      title: 'Confirmed Invoices',
      description: 'Manage finalized GST Tax Invoices. These are official business records that automatically log revenue to the ledger.',
      href: '/invoices/confirmed',
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoices</h1>
      <p className="text-gray-600 mb-8">Manage both draft estimates (Proforma) and finalized Tax Invoices.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoiceModules.map(module => (
          <Link href={module.href} key={module.id} className="block group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow hover:border-blue-300">
              <div className="flex items-center mb-4">
                <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {module.icon}
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
              </div>
              <p className="text-gray-500">
                {module.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
