'use client';

import { useActionState, useEffect } from 'react';
import { changePassword } from './actions';

import { useSession } from 'next-auth/react';

export default function ChangePasswordForm() {
  const { update } = useSession();
  const [state, formAction, isPending] = useActionState(
    changePassword,
    { success: false, error: '' },
  );

  useEffect(() => {
    if (state?.success) {
      update({ mustResetPassword: false }).then((newSession) => {
        if (newSession?.user?.role === 'ADMIN') {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/home';
        }
      });
    }
  }, [state, update]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Action Required
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please change your password before continuing.
          </p>
        </div>
        <form className="mt-8 space-y-6" action={formAction}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="New Password"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="relative block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isPending ? 'Saving...' : 'Change Password'}
            </button>
          </div>
          
          {state?.error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg border border-red-100">
              {state.error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
