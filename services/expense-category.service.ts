import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ExpenseCategoryService {
  static async getExpenseCategories(params?: { search?: string; isActive?: boolean }) {
    const { search, isActive } = params || {};
    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.name = { contains: search };
    }

    return await prisma.expenseCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });
  }

  static async getExpenseCategoryById(id: string) {
    return await prisma.expenseCategory.findUnique({
      where: { id },
    });
  }

  static async createExpenseCategory(data: { name: string; description?: string | null }) {
    if (!data.name || data.name.trim() === "") {
      throw new Error("Category name is required.");
    }

    const existing = await prisma.expenseCategory.findUnique({
      where: { name: data.name }
    });

    if (existing) {
      throw new Error("Category name already exists.");
    }

    return await prisma.expenseCategory.create({
      data: {
        name: data.name.trim(),
        description: data.description,
        isActive: true,
      }
    });
  }

  static async updateExpenseCategory(id: string, data: { name?: string; description?: string | null }) {
    if (data.name !== undefined && data.name.trim() === "") {
      throw new Error("Category name cannot be empty.");
    }

    if (data.name) {
      const existing = await prisma.expenseCategory.findUnique({
        where: { name: data.name.trim() }
      });
      if (existing && existing.id !== id) {
        throw new Error("Another category with this name already exists.");
      }
    }

    return await prisma.expenseCategory.update({
      where: { id },
      data: {
        ...data,
        name: data.name?.trim(),
      },
    });
  }

  static async toggleExpenseCategoryStatus(id: string, isActive: boolean) {
    return await prisma.expenseCategory.update({
      where: { id },
      data: { isActive },
    });
  }

  static async seedDefaultCategories() {
    const defaults = [
      "Office Rent", "Salaries & Wages", "Utilities", "Internet & Telephone",
      "Travel & Transportation", "Office Supplies", "Software & Subscriptions",
      "Marketing & Advertising", "Professional Fees", "Repairs & Maintenance",
      "Equipment", "Bank Charges", "Insurance", "Taxes & Government Fees", "Other"
    ];

    let created = 0;
    for (const name of defaults) {
      const existing = await prisma.expenseCategory.findUnique({ where: { name } });
      if (!existing) {
        await prisma.expenseCategory.create({ data: { name } });
        created++;
      }
    }
    return created;
  }
}
