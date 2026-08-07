'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials or inactive account.';
        default:
          return `Auth Error: ${error.type} - ${error.message}`;
      }
    }
    // If it's a redirect, throw it so Next.js handles it
    if ((error as any)?.message?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return `Server Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
