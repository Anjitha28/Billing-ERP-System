import { requireAdmin } from '@/lib/auth-utils';
import Link from 'next/link';

export default async function ReportsCenterPage() {
  await requireAdmin();

  const reportCategories = [
    {
      category: "Sales & Revenue",
      reports: [
        {
          id: 'sales',
          title: 'Sales Report',
          description: 'Detailed analysis of all confirmed Tax Invoices.',
          href: '/reports/sales',
          icon: (
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )
        },
        {
          id: 'revenue',
          title: 'Revenue Report',
          description: 'Overview of all recorded revenue transactions.',
          href: '/revenue',
          icon: (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          id: 'invoice-statement',
          title: 'Invoice Statement',
          description: 'Unified statement of all Proforma and Tax invoices.',
          href: '/reports/invoice-statement',
          icon: (
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        }
      ]
    },
    {
      category: "Expenses",
      reports: [
        {
          id: 'expenses',
          title: 'Expense Report',
          description: 'Comprehensive log of all approved business expenses.',
          href: '/reports/expenses',
          icon: (
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        }
      ]
    },
    {
      category: "Tax",
      reports: [
        {
          id: 'gst-outward',
          title: 'GST Outward Supplies',
          description: 'Summary of Output GST collected on sales for tax compliance.',
          href: '/reports/gst/outward-supplies',
          icon: (
            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          id: 'gst-input',
          title: 'Input Tax Credit (ITC)',
          description: 'Input GST / ITC Analysis from approved purchases.',
          href: '/reports/gst/input-tax-credit',
          icon: (
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          )
        },
        {
          id: 'tds',
          title: 'TDS Report',
          description: 'Detailed log of Tax Deducted at Source (TDS) on expenses.',
          href: '/reports/tds',
          icon: (
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      ]
    },
    {
      category: "Receivables & Payables",
      reports: [
        {
          id: 'receivables',
          title: 'Receivables Report',
          description: 'Monitor unpaid and partially paid customer invoices.',
          href: '/reports/receivables',
          icon: (
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        },
        {
          id: 'payables',
          title: 'Payables Report',
          description: 'Track outstanding amounts owed to vendors.',
          href: '/reports/payables',
          icon: (
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )
        }
      ]
    },
    {
      category: "Profit & Loss",
      reports: [
        {
          id: 'profit-loss',
          title: 'Profit & Loss Report',
          description: 'Comprehensive analysis of revenue, expenses, and net profit.',
          href: '/profit-loss',
          icon: (
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        },
        {
          id: 'balance-sheet',
          title: 'Balance Sheet',
          description: 'Snapshot of the business financial position (Assets, Liabilities, Equity).',
          href: '/reports/balance-sheet',
          icon: (
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports Center</h1>
      <p className="text-gray-600 mb-8">Access detailed operational and financial data through our comprehensive reporting modules.</p>

      <div className="space-y-10">
        {reportCategories.map(group => (
          <div key={group.category}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.reports.map(report => (
                <Link href={report.href} key={report.id} className="block group">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full hover:shadow-md transition-shadow hover:border-blue-300">
                    <div className="flex items-center mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                        {report.icon}
                      </div>
                      <h3 className="ml-4 text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {report.title}
                      </h3>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {report.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
