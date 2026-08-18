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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-theme-text">Record New Expense</h1>
          <p className="text-theme-text-muted mt-1 text-sm">Create a new draft expense record.</p>
        </div>
      </div>

      <ExpenseForm vendors={vendors} categories={categories} products={products} />
    </div>
  );
}
