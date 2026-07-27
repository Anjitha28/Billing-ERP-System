"use server";

import { revalidatePath } from "next/cache";
import { ExpenseCategoryService } from "@/services/expense-category.service";

export async function createExpenseCategoryAction(data: { name: string; description?: string }) {
  try {
    const category = await ExpenseCategoryService.createExpenseCategory(data);
    revalidatePath("/expense-categories");
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function updateExpenseCategoryAction(id: string, data: { name: string; description?: string }) {
  try {
    const category = await ExpenseCategoryService.updateExpenseCategory(id, data);
    revalidatePath("/expense-categories");
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category." };
  }
}

export async function toggleExpenseCategoryStatusAction(id: string, isActive: boolean) {
  try {
    await ExpenseCategoryService.toggleExpenseCategoryStatus(id, isActive);
    revalidatePath("/expense-categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle status." };
  }
}

export async function seedCategoriesAction() {
  try {
    const count = await ExpenseCategoryService.seedDefaultCategories();
    revalidatePath("/expense-categories");
    return { success: true, data: count };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to seed categories." };
  }
}
