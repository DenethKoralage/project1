"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWithAuth } from "@/lib/authApi";
import { PortfolioHeroCard } from "@/components/organisms";
import { PortfolioSubpageTemplate } from "@/components/templates";
import { StatusBanner } from "@/components/atoms";
import { pick } from "@/utils/pick";
import { formatMoney } from "@/utils/formatMoney";
import { toDateInput } from "@/utils/toDateInput";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpenseLineChart } from "./ExpenseLineChart";
import { ExpenseListTable } from "./ExpenseListTable";

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
  const [chartMode, setChartMode] = useState("monthly");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + Number(pick(expense, "Amount", "amount") || 0),
    0
  );

  const handleExpenseAdded = () => {
    loadExpenses();
    setIsFormOpen(false);
  };

  const topCategory = (() => {
    const totals = {};
    filteredExpenses.forEach((e) => {
      const cat = String(pick(e, "Category", "category") || "Other");
      totals[cat] = (totals[cat] || 0) + Number(pick(e, "Amount", "amount") || 0);
    });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  })();

  return (
    <PortfolioSubpageTemplate
      heroSlot={
        <PortfolioHeroCard
          title="Expenses"
          description="Track outgoing money by category, date, and amount, filter progress monthly or annually, and keep each source searchable."
          backHref="/portfolio"
          stats={[
            { value: filteredExpenses.length, label: "Records", valueClassName: "text-emerald-300" },
            { value: isLoading ? "…" : formatMoney(totalExpenses), label: "Visible Total", valueClassName: "text-rose-300" },
            { value: topCategory, label: "Top Category", valueClassName: "text-lg font-black text-amber-300 truncate" },
          ]}
          actionLabel="Add Expense"
          onAction={() => setIsFormOpen(true)}
        />
      }
      statusSlot={
        <StatusBanner type={status.type} message={status.message} variant="portfolio" />
      }
    >

      <section className="grid gap-5 min-w-0">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Current expense progress
              </p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">
                Spent by date and amount
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

          <div className="mt-6 w-full min-w-0">
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

      </section>

      <ExpenseListTable
        expenses={filteredExpenses}
        search={search}
        setSearch={setSearch}
        user={user}
      />

      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        aria-label="Add new expense"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl font-semibold leading-none text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        +
      </button>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 px-4 py-6 sm:items-center">
          <button
            type="button"
            aria-label="Close add expense form"
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative w-full max-w-md">
            <AddExpenseForm
              token={token}
              onExpenseAdded={handleExpenseAdded}
              onClose={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </PortfolioSubpageTemplate>
  );
}