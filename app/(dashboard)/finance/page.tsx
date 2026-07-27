import { requireAdmin } from '@/lib/auth-utils';
import Link from 'next/link';
import { RevenueLedger } from './RevenueLedger';
import { UnifiedLedger } from './UnifiedLedger';

export default async function FinanceHubPage({
  searchParams
}: {
  searchParams: { tab?: string; [key: string]: any }
}) {
  await requireAdmin();

  // Await searchParams per Next.js 16 requirements
  const params = await Promise.resolve(searchParams);
  const activeTab = params.tab || 'revenue';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
        <p className="text-gray-600 mt-1">Access detailed financial transaction ledgers and accounting records.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/finance?tab=revenue"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'revenue'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Revenue Ledger
          </Link>
          <Link
            href="/finance?tab=unified"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'unified'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            Unified Ledger
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'revenue' ? (
          <RevenueLedger searchParams={params as any} />
        ) : (
          <UnifiedLedger searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
