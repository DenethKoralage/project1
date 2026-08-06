"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWithAuth } from "@/lib/authApi";
import { AddExpenseForm } from "./AddExpenseForm";
import { ExpenseLineChart } from "./ExpenseLineChart";
import { ExpenseListTable } from "./ExpenseListTable";

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
    <main className="mx-auto w-full max-w-6xl min-w-0 space-y-6 py-8">
      {/* ── HERO CARD ── */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8 text-white shadow-xl md:p-10">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <Link href="/portfolio" className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-500/30">
              ← Portfolio
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Expenses</h1>
            <p className="text-sm leading-relaxed text-emerald-100/80 max-w-xl">
              Track outgoing money by category, date, and amount, filter progress monthly or annually, and keep each source searchable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="self-start md:self-center inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-emerald-300 hover:scale-[1.02]"
          >
            <span>➕</span> Add Expense
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-emerald-300">{filteredExpenses.length}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Records</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-rose-300">{isLoading ? "…" : formatMoney(totalExpenses)}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Visible Total</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-lg font-black text-amber-300 truncate">{topCategory}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Top Category</p>
          </div>
        </div>
      </section>

      {status.message ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm font-medium ${status.type === "success"
            ? "bg-emerald-50 text-emerald-800"
            : "bg-rose-50 text-rose-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

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
    </main>
  );
}