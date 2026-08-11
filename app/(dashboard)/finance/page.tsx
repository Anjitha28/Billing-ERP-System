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
        <h1 className="text-2xl font-bold text-theme-text">Finance</h1>
        <p className="text-theme-text-muted mt-1">Access detailed financial transaction ledgers and accounting records.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/finance?tab=revenue"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'revenue'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-gray-200 hover:border-theme-border'
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
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-gray-200 hover:border-theme-border'
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
