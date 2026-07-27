import { ExpenseCategoryService } from "@/services/expense-category.service";
import { CategoryClient } from "./CategoryClient";

export async function ExpenseCategories({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const categories = await ExpenseCategoryService.getExpenseCategories({ search: query });

  return (
    <div className="space-y-6 mt-6">

      <CategoryClient initialCategories={categories} query={query} />
    </div>
  );
}
