import { prisma } from "@/lib/prisma";
import { PrismaClient, ExpenseStatus, PaymentStatus } from "@prisma/client";
import { FinancialTransactionService } from "./financial-transaction.service";


export class ExpenseService {
  private static async generateExpenseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `EXP-${year}-`;
    
    const latestExpense = await prisma.expense.findFirst({
      where: { expenseNumber: { startsWith: prefix } },
      orderBy: { expenseNumber: 'desc' },
    });

    if (!latestExpense) {
      return `${prefix}0001`;
    }

    const lastSequenceStr = latestExpense.expenseNumber.replace(prefix, "");
    const nextSequence = parseInt(lastSequenceStr, 10) + 1;
    return `${prefix}${nextSequence.toString().padStart(4, "0")}`;
  }

  static async getExpenses(params?: { 
    search?: string; 
    status?: ExpenseStatus; 
    paymentStatus?: PaymentStatus;
    categoryId?: string;
  }) {
    const { search, status, paymentStatus, categoryId } = params || {};
    const where: any = {};

    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (categoryId) where.categoryId = categoryId;

    if (search) {
      where.OR = [
        { expenseNumber: { contains: search } },
        { description: { contains: search } },
        { vendor: { name: { contains: search } } },
      ];
    }

    return await prisma.expense.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: true,
        category: true,
      }
    });
  }

  static async getExpenseById(id: string) {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        items: true,
        vendor: true,
        category: true,
      },
    });
  }

  static async getDashboardMetrics() {
    const expenses = await prisma.expense.findMany();
    
    return {
      totalCount: expenses.length,
      approvedCount: expenses.filter(e => e.status === "APPROVED").length,
      draftCount: expenses.filter(e => e.status === "DRAFT").length,
      unpaidCount: expenses.filter(e => e.paymentStatus === "UNPAID" && e.status !== "CANCELLED").length,
      totalValue: expenses.filter(e => e.status !== "CANCELLED").reduce((sum, exp) => sum + Number(exp.netAmount), 0),
    };
  }

  static async createExpense(data: any) {
    return await prisma.$transaction(async (tx) => {
      const expenseNumber = await this.generateExpenseNumber();

      const expense = await tx.expense.create({
        data: {
          expenseNumber,
          expenseDate: new Date(data.expenseDate),
          description: data.description,
          vendorId: data.vendorId || null,
          categoryId: data.categoryId,
          status: "DRAFT",
          paymentStatus: "UNPAID",

          subtotal: data.subtotal,
          discountAmount: data.discountAmount || 0,
          taxableAmount: data.taxableAmount,

          inputCGST: data.inputCGST || 0,
          inputSGST: data.inputSGST || 0,
          inputIGST: data.inputIGST || 0,
          totalInputGST: data.totalInputGST || 0,

          tdsRate: data.tdsRate,
          tdsAmount: data.tdsAmount || 0,

          grossAmount: data.grossAmount,
          netAmount: data.netAmount,
          notes: data.notes,

          items: {
            create: data.items.map((item: any) => ({
              description: item.description,
              hsnSacCode: item.hsnSacCode,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              gstRate: item.gstRate,
              taxableAmount: item.taxableAmount,
              cgstRate: item.cgstRate || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstRate: item.sgstRate || 0,
              sgstAmount: item.sgstAmount || 0,
              igstRate: item.igstRate || 0,
              igstAmount: item.igstAmount || 0,
              totalGST: item.totalGST || 0,
              totalAmount: item.totalAmount
            }))
          }
        }
      });
      return expense;
    });
  }

  static async updateExpense(id: string, data: any) {
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new Error("Expense not found");
    if (current.status !== "DRAFT") throw new Error("Only draft expenses can be freely edited.");

    return await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.expenseItem.deleteMany({ where: { expenseId: id } });

      // Update expense and recreate items
      return await tx.expense.update({
        where: { id },
        data: {
          expenseDate: new Date(data.expenseDate),
          description: data.description,
          vendorId: data.vendorId || null,
          categoryId: data.categoryId,

          subtotal: data.subtotal,
          discountAmount: data.discountAmount || 0,
          taxableAmount: data.taxableAmount,

          inputCGST: data.inputCGST || 0,
          inputSGST: data.inputSGST || 0,
          inputIGST: data.inputIGST || 0,
          totalInputGST: data.totalInputGST || 0,

          tdsRate: data.tdsRate,
          tdsAmount: data.tdsAmount || 0,

          grossAmount: data.grossAmount,
          netAmount: data.netAmount,
          notes: data.notes,

          items: {
            create: data.items.map((item: any) => ({
              description: item.description,
              hsnSacCode: item.hsnSacCode,
              quantity: item.quantity,
              unit: item.unit,
              unitPrice: item.unitPrice,
              gstRate: item.gstRate,
              taxableAmount: item.taxableAmount,
              cgstRate: item.cgstRate || 0,
              cgstAmount: item.cgstAmount || 0,
              sgstRate: item.sgstRate || 0,
              sgstAmount: item.sgstAmount || 0,
              igstRate: item.igstRate || 0,
              igstAmount: item.igstAmount || 0,
              totalGST: item.totalGST || 0,
              totalAmount: item.totalAmount
            }))
          }
        }
      });
    });
  }

  static async approveExpense(id: string) {
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new Error("Expense not found");
    if (current.status !== "DRAFT") throw new Error("Only draft expenses can be approved.");

    return await prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      await FinancialTransactionService.createExpenseTransaction(tx, {
        sourceId: updatedExpense.id,
        transactionDate: updatedExpense.expenseDate,
        description: `Expense ${updatedExpense.expenseNumber}`,
        amount: updatedExpense.grossAmount,
        taxableAmount: updatedExpense.taxableAmount,
        totalGST: updatedExpense.totalInputGST,
        tdsAmount: updatedExpense.tdsAmount,
        netAmount: updatedExpense.netAmount,
      });

      return updatedExpense;
    });
  }

  static async cancelExpense(id: string, reason: string) {
    if (!reason || reason.trim() === "") throw new Error("Cancellation reason is required.");
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new Error("Expense not found");
    if (current.status === "CANCELLED") throw new Error("Expense is already cancelled.");
    if (current.paymentStatus === "PAID") throw new Error("Cannot cancel a paid expense.");

    return await prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          status: "CANCELLED",
          cancellationReason: reason,
          cancelledAt: new Date(),
        }
      });

      await FinancialTransactionService.deleteTransactionBySource(tx, "EXPENSE", id);

      return updatedExpense;
    });
  }

  static async updatePaymentStatus(id: string, status: PaymentStatus) {
    const current = await prisma.expense.findUnique({ where: { id } });
    if (!current) throw new Error("Expense not found");
    if (current.status === "CANCELLED") throw new Error("Cannot update payment status of a cancelled expense.");

    return await prisma.expense.update({
      where: { id },
      data: { paymentStatus: status }
    });
  }
}
