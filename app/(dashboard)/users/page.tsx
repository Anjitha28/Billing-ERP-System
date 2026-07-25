import { requireAdmin } from '@/lib/auth-utils';
import { PrismaClient } from '@prisma/client';
import { UserClientList } from './UserClientList';

const prisma = new PrismaClient();

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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage admin and staff access to the ERP system.</p>
        </div>
      </div>

      <UserClientList initialUsers={serializedUsers} />
    </div>
  );
}
