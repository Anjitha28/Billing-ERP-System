import { prisma } from "@/lib/prisma";


export interface DateFilter {
  fromDate?: Date;
  toDate?: Date;
}

export class DashboardService {
  private static getDateWhereClause(filters?: DateFilter) {
    const where: any = {};
    if (filters?.fromDate || filters?.toDate) {
      where.transactionDate = {};
      if (filters.fromDate) where.transactionDate.gte = filters.fromDate;
      if (filters.toDate) {
        const end = new Date(filters.toDate);
        end.setHours(23, 59, 59, 999);
        where.transactionDate.lte = end;
      }
    }
    return where;
  }

  private static getSourceDateWhereClause(dateField: string, filters?: DateFilter) {
    const where: any = {};
    if (filters?.fromDate || filters?.toDate) {
      where[dateField] = {};
      if (filters.fromDate) where[dateField].gte = filters.fromDate;
      if (filters.toDate) {
        const end = new Date(filters.toDate);
        end.setHours(23, 59, 59, 999);
        where[dateField].lte = end;
      }
    }
    return where;
  }

  static async getDashboardKPIs(filters?: DateFilter) {
    const where = this.getDateWhereClause(filters);

    const txns = await prisma.financialTransaction.findMany({ where });

    let totalRevenue = 0;
    let totalExpenses = 0;
    let outstandingReceivables = 0;
    let outstandingPayables = 0;

    for (const txn of txns) {
      const net = Number(txn.netAmount);
      if (txn.type === "REVENUE") {
        totalRevenue += net;
        if (txn.paymentStatus !== "PAID") {
          outstandingReceivables += net; // Simplified for now since we don't track partial amounts yet
        }
      } else if (txn.type === "EXPENSE") {
        totalExpenses += net;
        if (txn.paymentStatus !== "PAID") {
          outstandingPayables += net;
        }
      }
    }

    const operatingResult = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (operatingResult / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      operatingResult,
      profitMargin,
      outstandingReceivables,
      outstandingPayables
    };
  }

  static async getRevenueVsExpenseTrend(filters?: DateFilter) {
    const where = this.getDateWhereClause(filters);
    const txns = await prisma.financialTransaction.findMany({
      where,
      orderBy: { transactionDate: 'asc' }
    });

    const monthlyData: Record<string, { month: string, revenue: number, expenses: number }> = {};

    for (const txn of txns) {
      const date = new Date(txn.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthLabel, revenue: 0, expenses: 0 };
      }

      if (txn.type === "REVENUE") {
        monthlyData[monthKey].revenue += Number(txn.netAmount);
      } else {
        monthlyData[monthKey].expenses += Number(txn.netAmount);
      }
    }

    return Object.values(monthlyData);
  }

  static async getExpenseByCategory(filters?: DateFilter) {
    const where = {
      status: "APPROVED",
      ...this.getSourceDateWhereClause("expenseDate", filters)
    } as any;

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true }
    });

    const categoryMap: Record<string, { category: string; amount: number }> = {};
    let totalExpenses = 0;

    for (const exp of expenses) {
      const name = exp.category.name;
      const net = Number(exp.netAmount);
      if (!categoryMap[name]) categoryMap[name] = { category: name, amount: 0 };
      categoryMap[name].amount += net;
      totalExpenses += net;
    }

    return Object.values(categoryMap).map(c => ({
      ...c,
      percentage: totalExpenses > 0 ? (c.amount / totalExpenses) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }

  static async getRevenueByCustomer(filters?: DateFilter) {
    const where = {
      status: { in: ["CONFIRMED", "PAID", "PARTIALLY_PAID"] },
      ...this.getSourceDateWhereClause("invoiceDate", filters)
    } as any;

    const invoices = await prisma.taxInvoice.findMany({
      where,
      include: { customer: true }
    });

    const customerMap: Record<string, { customer: string; amount: number }> = {};
    let totalRevenue = 0;

    for (const inv of invoices) {
      const name = inv.customerNameSnapshot || inv.customer.legalName;
      const net = Number(inv.netAmount);
      if (!customerMap[name]) customerMap[name] = { customer: name, amount: 0 };
      customerMap[name].amount += net;
      totalRevenue += net;
    }

    return Object.values(customerMap).map(c => ({
      ...c,
      percentage: totalRevenue > 0 ? (c.amount / totalRevenue) * 100 : 0
    })).sort((a, b) => b.amount - a.amount).slice(0, 5); // Top 5
  }

  static async getPaymentStatusSummary(filters?: DateFilter) {
    const where = this.getDateWhereClause(filters);
    const txns = await prisma.financialTransaction.findMany({ where });

    const summary = {
      revenue: { PAID: 0, PARTIALLY_PAID: 0, UNPAID: 0 },
      expenses: { PAID: 0, PARTIALLY_PAID: 0, UNPAID: 0 }
    };

    for (const txn of txns) {
      const type = txn.type === "REVENUE" ? "revenue" : "expenses";
      const status = txn.paymentStatus;
      summary[type][status] += Number(txn.netAmount);
    }

    return summary;
  }

  static async getMonthlyFinancialSummary(filters?: DateFilter) {
    const trends = await this.getRevenueVsExpenseTrend(filters);
    return trends.map(t => ({
      month: t.month,
      revenue: t.revenue,
      expenses: t.expenses,
      operatingResult: t.revenue - t.expenses,
      profitMargin: t.revenue > 0 ? ((t.revenue - t.expenses) / t.revenue) * 100 : 0
    })).reverse(); // Latest month first
  }

  static async getTopExpenses(filters?: DateFilter) {
    const where = {
      status: "APPROVED",
      ...this.getSourceDateWhereClause("expenseDate", filters)
    } as any;

    return await prisma.expense.findMany({
      where,
      include: { vendor: true, category: true },
      orderBy: { netAmount: 'desc' },
      take: 5
    });
  }

  static async getFinancialInsights(filters?: DateFilter) {
    const kpis = await this.getDashboardKPIs(filters);
    const insights: string[] = [];

    if (kpis.totalRevenue === 0 && kpis.totalExpenses === 0) {
      insights.push("No financial data available for the selected period.");
      return insights;
    }

    if (kpis.operatingResult > 0) {
      insights.push("Operating result is positive for the selected period.");
    } else if (kpis.operatingResult < 0) {
      insights.push("Expenses exceed revenue for the selected period.");
    } else {
      insights.push("Revenue and expenses are exactly equal for the selected period.");
    }

    if (kpis.totalRevenue > 0 && (kpis.outstandingReceivables / kpis.totalRevenue) > 0.3) {
      insights.push("Outstanding receivables represent a significant portion (over 30%) of total revenue.");
    }

    const categories = await this.getExpenseByCategory(filters);
    if (categories.length > 0 && categories[0].percentage > 40) {
      insights.push(`A significant portion of expenses (${categories[0].percentage.toFixed(1)}%) comes from ${categories[0].category}.`);
    }

    return insights;
  }
}
