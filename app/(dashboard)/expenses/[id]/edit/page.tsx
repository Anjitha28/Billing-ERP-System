import { ExpenseForm } from "../../ExpenseForm";
import { ExpenseService } from "@/services/expense.service";
import { VendorService } from "@/services/vendor.service";
import { ExpenseCategoryService } from "@/services/expense-category.service";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const expense = await ExpenseService.getExpenseById(id);

  if (!expense) {
    notFound();
  }

  if (expense.status !== "DRAFT") {
    redirect(`/expenses/${expense.id}`); // Only drafts can be edited
  }

  const [vendors, categories, products] = await Promise.all([
    VendorService.getVendors({ isActive: true }),
    ExpenseCategoryService.getExpenseCategories({ isActive: true }),
    prisma.product.findMany({ where: { isActive: true } })
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Draft Expense</h1>
        <p className="text-gray-500 text-sm mt-1">Update draft information for {expense.expenseNumber}.</p>
      </div>

      <ExpenseForm initialData={expense} vendors={vendors} categories={categories} products={products} />
    </div>
  );
}
