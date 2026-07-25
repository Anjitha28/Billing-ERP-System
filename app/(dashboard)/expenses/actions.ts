"use server";

import { revalidatePath } from "next/cache";
import { ExpenseService } from "@/services/expense.service";
import { PaymentStatus } from "@prisma/client";

export async function createExpenseAction(data: any) {
  try {
    const expense = await ExpenseService.createExpense(data);
    revalidatePath("/expenses");
    return { success: true, data: expense };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create expense." };
  }
}

export async function updateExpenseAction(id: string, data: any) {
  try {
    const expense = await ExpenseService.updateExpense(id, data);
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    return { success: true, data: expense };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update expense." };
  }
}

export async function approveExpenseAction(id: string) {
  try {
    await ExpenseService.approveExpense(id);
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to approve expense." };
  }
}

export async function cancelExpenseAction(id: string, reason: string) {
  try {
    await ExpenseService.cancelExpense(id, reason);
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel expense." };
  }
}

export async function updatePaymentStatusAction(id: string, status: PaymentStatus) {
  try {
    await ExpenseService.updatePaymentStatus(id, status);
    revalidatePath("/expenses");
    revalidatePath(`/expenses/${id}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update payment status." };
  }
}
