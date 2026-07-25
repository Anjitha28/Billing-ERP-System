import { ExpenseForm } from "../ExpenseForm";
import { VendorService } from "@/services/vendor.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";

export default async function NewExpensePage() {
  const [vendors, categories] = await Promise.all([
    VendorService.getVendors({ isActive: true }),
    ExpenseCategoryService.getExpenseCategories({ isActive: true })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Record New Expense</h1>
        <p className="text-gray-500 text-sm mt-1">Create a new draft expense record.</p>
      </div>

      <ExpenseForm vendors={vendors} categories={categories} />
    </div>
  );
}
