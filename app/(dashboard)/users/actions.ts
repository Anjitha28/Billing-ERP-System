'use server';

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth-utils';

const prisma = new PrismaClient();

export async function createUser(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;

  const defaultPassword = 'password';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        mustResetPassword: true,
      }
    });
    revalidatePath('/users');
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Email already exists' };
    return { success: false, error: 'Failed to create user' };
  }
}

export async function updateUser(id: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as Role;

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email, role },
    });
    revalidatePath('/users');
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') return { success: false, error: 'Email already exists' };
    return { success: false, error: 'Failed to update user' };
  }
}

export async function toggleUserStatus(id: string, isActive: boolean) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id },
      data: { isActive: !isActive },
    });
    revalidatePath('/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to update status' };
  }
}

export async function resetUserPassword(id: string) {
  await requireAdmin();

  const defaultPassword = 'password';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  try {
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        mustResetPassword: true,
      },
    });
    revalidatePath('/users');
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to reset password' };
  }
}
