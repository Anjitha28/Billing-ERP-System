import { ExpenseCategoryService } from "@/services/expense-category.service";
import { CategoryClient } from "./CategoryClient";

export const dynamic = "force-dynamic";

export default async function ExpenseCategoriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const categories = await ExpenseCategoryService.getExpenseCategories({ search: query });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Manage categories to organize your business expenses.</p>
        </div>
      </div>

      <CategoryClient initialCategories={categories} query={query} />
    </div>
  );
}
