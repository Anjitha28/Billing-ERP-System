'use client';

import { signOut } from 'next-auth/react';

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="text-sm font-medium text-red-600 hover:text-red-800 focus:outline-none"
    >
      Logout
    </button>
  );
}
