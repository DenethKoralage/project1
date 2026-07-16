"use client";

import { useMemo } from "react";
import { expenseCategories } from "./expenseCategories";

const pick = (item, pascal, camel) => item?.[pascal] ?? item?.[camel];

const toDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export function ExpenseListTable({ expenses, search, user }) {
  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((expense) => {
      const category = String(pick(expense, "Category", "category") || "").toLowerCase();
      const date = toDateInput(pick(expense, "ExpenseDate", "expenseDate"));
      return category.includes(term) || date.includes(term);
    });
  }, [expenses, search]);

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + Number(pick(expense, "Amount", "amount") || 0),
    0
  );

  return (
    <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            Expense records
          </p>
          <h2 className="mt-1 text-xl font-semibold text-stone-950">
            Search by date or category
          </h2>
        </div>
        <input
          value={search}
          onChange={(event) => {}}
          placeholder="Search category or YYYY-MM-DD"
          className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 outline-none focus:border-rose-500 sm:w-72"
        />
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.14em] text-stone-400">
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Category</th>
              <th className="py-3 pr-4 text-right">Amount</th>
              <th className="py-3">Description</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense) => (
              <tr
                key={pick(expense, "Id", "id")}
                className="border-b border-stone-100 text-stone-700"
              >
                <td className="py-3 pr-4">
                  {toDateInput(pick(expense, "ExpenseDate", "expenseDate"))}
                </td>
                <td className="py-3 pr-4 font-medium text-stone-950">
                  {pick(expense, "Category", "category")}
                </td>
                <td className="py-3 pr-4 text-right font-semibold text-rose-700">
                  {formatMoney(pick(expense, "Amount", "amount"))}
                </td>
                <td className="py-3 text-stone-500">
                  {pick(expense, "Description", "description") || "-"}
                </td>
              </tr>
            ))}
            {!filteredExpenses.length ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-stone-500">
                  No expenses found for {user?.Name ?? user?.name ?? "this user"}.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
        <p className="text-sm font-medium text-stone-600">
          Visible Total:
          <span className="ml-2 font-bold text-rose-700">{formatMoney(totalExpenses)}</span>
        </p>
        <p className="text-sm text-stone-500">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? "s" : ""}
        </p>
      </div>
    </section>
  );
}