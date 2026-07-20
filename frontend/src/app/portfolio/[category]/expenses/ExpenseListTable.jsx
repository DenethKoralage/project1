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

// Wrap a field in quotes and escape any embedded quotes, per CSV spec
const csvEscape = (value) => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export function ExpenseListTable({ expenses, search, setSearch, user }) {
  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((expense) => {
      const category = String(pick(expense, "Category", "category") || "").toLowerCase();
      const date = toDateInput(pick(expense, "ExpenseDate", "expenseDate"));
      return category.includes(term) || date.includes(term);
    });
  }, [expenses, search]);

  const handleExport = () => {
    const header = ["Date", "Category", "Amount", "Description"];
    const rows = filteredExpenses.map((expense) => {
      const category = pick(expense, "Category", "category");
      const date = toDateInput(pick(expense, "ExpenseDate", "expenseDate"));
      const amount = Number(pick(expense, "Amount", "amount") || 0);
      const description = pick(expense, "Description", "description") || "-";
      return [date, category, amount, description].map(csvEscape).join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
        <select
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        >
          <option value="">All categories</option>
          {expenseCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <button
          onClick={handleExport}
          className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
        >
          Export Excel
        </button>
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
