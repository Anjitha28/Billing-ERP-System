import { prisma } from "@/lib/prisma";
'use server';

import { auth } from '@/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';


export async function changePassword(
  prevState: any,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Not authenticated' };
  }

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustResetPassword: false,
      },
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to update password.' };
  }

  return { success: true, error: '' };
}
