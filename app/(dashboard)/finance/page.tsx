import { requireAdmin } from '@/lib/auth-utils';
import Link from 'next/link';

export default async function FinanceHubPage() {
  await requireAdmin();

  const financeModules = [
    {
      id: 'revenue',
      title: 'Revenue Ledger',
      description: 'Track all incoming revenue generated from Confirmed Tax Invoices. Immutable ledger of all business income.',
      href: '/revenue',
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'unified',
      title: 'Unified Ledger',
      description: 'Comprehensive view of all financial transactions, combining both revenue and expenses into a single master journal.',
      href: '/ledger',
      icon: (
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Finance</h1>
      <p className="text-gray-600 mb-8">Access detailed financial transaction ledgers and accounting records.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {financeModules.map(module => (
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
