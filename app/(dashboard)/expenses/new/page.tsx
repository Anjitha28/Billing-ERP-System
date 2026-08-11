import { ExpenseForm } from "../ExpenseForm";
import { VendorService } from "@/services/vendor.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";
import { prisma } from "@/lib/prisma";

export default async function NewExpensePage() {
  const [vendors, categories, products] = await Promise.all([
    VendorService.getVendors({ isActive: true }),
    ExpenseCategoryService.getExpenseCategories({ isActive: true }),
    prisma.product.findMany({ where: { isActive: true } })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-theme-text">Record New Expense</h1>
        <p className="text-theme-text-muted text-sm mt-1">Create a new draft expense record.</p>
      </div>

      <ExpenseForm vendors={vendors} categories={categories} products={products} />
    </div>
  );
}
