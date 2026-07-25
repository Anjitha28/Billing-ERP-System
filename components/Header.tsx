import { auth, signOut } from '@/auth';

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800">Billing ERP System</h1>
      <div className="flex items-center space-x-6">
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-gray-900">{user?.name || 'Guest'}</span>
          <span className="text-xs text-gray-500">{(user as any)?.role || 'USER'}</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
          {user?.name?.[0] || 'G'}
        </div>
        
        {user && (
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
            >
              Logout
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
