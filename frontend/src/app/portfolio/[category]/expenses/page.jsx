"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWithAuth, postWithAuth } from "@/lib/authApi";
import { ExpenseLineChart } from "./ExpenseLineChart";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpenseListTable } from "./ExpenseListTable";
import { expenseCategories } from "./expenseCategories";

const emptyExpenseForm = {
  Amount: "",
  Category: expenseCategories[0],
  ExpenseDate: new Date().toISOString().slice(0, 10),
  Description: "",
};

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

function groupExpenses(expenses, mode) {
  const formatter =
    mode === "annual"
      ? (date) => String(date.getFullYear())
      : mode === "daily"
        ? (date) =>
            date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
        : (date) =>
            date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });

  const keyOf =
    mode === "daily"
      ? (date) => date.toISOString().slice(0, 10)
      : formatter;

  return expenses
    .reduce((groups, expense) => {
      const date = new Date(pick(expense, "ExpenseDate", "expenseDate"));
      const key = keyOf(date);
      const label = formatter(date);
      const existing = groups.find((group) => group.key === key);
      const amount = Number(pick(expense, "Amount", "amount") || 0);

      if (existing) {
        existing.amount += amount;
      } else {
        groups.push({ key, label, amount, time: date.getTime() });
      }

      return groups;
    }, [])
    .sort((a, b) => a.time - b.time);
}

export function ExpensesPage() {
  const { token, loading, user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [chartMode, setChartMode] = useState("daily");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadExpenses = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getWithAuth("/api/expense", token);
      setExpenses(Array.isArray(data) ? data : []);
      setStatus({ type: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not load expenses.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!loading && token) {
        loadExpenses();
      } else if (!loading && !token) {
        setIsLoading(false);
        setStatus({ type: "error", message: "Log in to manage expenses." });
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadExpenses, loading, token]);

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return expenses;

    return expenses.filter((expense) => {
      const category = String(pick(expense, "Category", "category") || "").toLowerCase();
      const date = toDateInput(pick(expense, "ExpenseDate", "expenseDate"));
      return category.includes(term) || date.includes(term);
    });
  }, [expenses, search]);

  const chartData = useMemo(
    () => groupExpenses(filteredExpenses, chartMode),
    [chartMode, filteredExpenses]
  );

  const totalExpense = filteredExpenses.reduce(
    (total, expense) => total + Number(pick(expense, "Amount", "amount") || 0),
    0
  );

  const handleAddExpense = async (formData) => {
    if (Number(formData.Amount) <= 0) {
      setStatus({ type: "error", message: "Enter an amount greater than zero." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      await postWithAuth(
        "/api/expense",
        {
          Amount: Number(formData.Amount),
          Category: formData.Category,
          ExpenseDate: new Date(formData.ExpenseDate).toISOString(),
          Description: formData.Description,
        },
        token
      );
      setStatus({ type: "success", message: "Expense added successfully." });
      await loadExpenses();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not add expense.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Link href="/portfolio" className="text-sm font-semibold text-emerald-700">
            Portfolio
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Expenses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Track outgoing money by date and amount, filter progress daily,
            monthly, or annually, and keep each category searchable.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
            Visible Total
          </p>
          <p className="mt-1 text-2xl font-bold text-stone-950">
            {formatMoney(totalExpense)}
          </p>
        </div>
      </div>

      {status.message ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Current expense progress
              </p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">
                Spending by date and amount
              </h2>
            </div>
            <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1">
              {["daily", "monthly", "annual"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold capitalize ${
                    chartMode === mode
                      ? "bg-stone-950 text-white"
                      : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 w-full">
            {isLoading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-stone-500">
                Loading expense progress...
              </div>
            ) : chartData.length ? (
              <ExpenseLineChart data={chartData} />
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-stone-500">
                No expense records match this view.
              </div>
            )}
          </div>
        </div>

        <AddExpenseForm
          onSubmit={handleAddExpense}
          isSaving={isSaving}
          token={token}
        />
      </section>

      <ExpenseListTable
        expenses={filteredExpenses}
        search={search}
        setSearch={setSearch}
        user={user}
      />
    </main>
  );
}