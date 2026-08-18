import { prisma } from "@/lib/prisma";
import { requireAdmin } from '@/lib/auth-utils';
import { UserClientList } from './UserClientList';


export const metadata = {
  title: 'User Management - Billing ERP',
};

export default async function UsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustResetPassword: true,
      createdAt: true,
    }
  });

  // Serialize dates for Client Component
  const serializedUsers = JSON.parse(JSON.stringify(users));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">User Management</h1>
          <p className="text-theme-text-muted text-sm mt-1">Manage admin and staff access to the ERP system.</p>
        </div>
      </div>

      <UserClientList initialUsers={serializedUsers} />
    </div>
  );
}
