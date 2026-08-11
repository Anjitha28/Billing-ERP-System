import { requireAuth } from '@/lib/auth-utils';
import Link from 'next/link';
import { ProformaInvoices } from './ProformaInvoices';
import { ConfirmedInvoices } from './ConfirmedInvoices';

export default async function InvoicesHubPage({
  searchParams
}: {
  searchParams: { tab?: string; [key: string]: any }
}) {
  await requireAuth();

  // Await searchParams per Next.js 16 requirements
  const params = await Promise.resolve(searchParams);
  const activeTab = params.tab || 'proforma';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-text">Invoices</h1>
        <p className="text-theme-text-muted mt-1">Manage both draft estimates (Proforma) and finalized Tax Invoices.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-theme-border">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <Link
            href="/invoices?tab=proforma"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'proforma'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-theme-text hover:border-theme-border'
              }
            `}
          >
            Proforma Invoice
          </Link>
          <Link
            href="/invoices?tab=confirmed"
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'confirmed'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-theme-text hover:border-theme-border'
              }
            `}
          >
            Confirmed Invoice
          </Link>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-2">
        {activeTab === 'proforma' ? (
          <ProformaInvoices />
        ) : (
          <ConfirmedInvoices searchParams={params as any} />
        )}
      </div>
    </div>
  );
}
