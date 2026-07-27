import { requireAuth } from '@/lib/auth-utils';

export default async function UserHomePage() {
  const session = await requireAuth();
  
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome, {session?.user?.name}!</h1>
      <p className="text-gray-600 text-lg">
        This is your User Dashboard. You have been successfully authenticated.
      </p>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/invoices" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition group">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Manage Invoices &rarr;</h3>
            <p className="text-sm text-gray-500 mt-1">Create and track customer invoices</p>
          </a>
          <a href="/expenses" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition group">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Record Expenses &rarr;</h3>
            <p className="text-sm text-gray-500 mt-1">Log business expenses and bills</p>
          </a>
        </div>
      </div>
    </div>
  );
}
