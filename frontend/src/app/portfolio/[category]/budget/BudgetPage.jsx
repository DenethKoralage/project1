"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/lib/authApi";

const emptyBudgetForm = {
  Name: "",
  Amount: "",
  Category: "Planned Spending",
  ExpectedDate: new Date().toISOString().slice(0, 10),
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

function BudgetAllocationForm({ form, onChange, onSubmit, isSaving, token, availableToAllocate }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Purpose</span>
        <input name="Name" value={form.Name} onChange={onChange} required maxLength={120} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Amount</span>
        <input name="Amount" type="number" min="0.01" step="0.01" value={form.Amount} onChange={onChange} required className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Category</span>
        <input name="Category" value={form.Category} onChange={onChange} required maxLength={120} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Expected Date</span>
        <input name="ExpectedDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.ExpectedDate} onChange={onChange} required className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Description</span>
        <textarea name="Description" value={form.Description} onChange={onChange} maxLength={512} rows={3} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
      </label>
      <button
        type="submit"
        disabled={isSaving || !token || availableToAllocate <= 0}
        className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Allocating..." : "Allocate Budget"}
      </button>
    </form>
  );
}

export function BudgetPage() {
  const { token, loading, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState(emptyBudgetForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadBudgetData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [summaryData, budgetData] = await Promise.all([
        getWithAuth("/api/budget/summary", token),
        getWithAuth("/api/budget", token),
      ]);
      setSummary(summaryData);
      setBudgets(Array.isArray(budgetData) ? budgetData : []);
      setStatus({ type: "", message: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not load budget details." });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!loading && token) {
        loadBudgetData();
      } else if (!loading && !token) {
        setIsLoading(false);
        setStatus({ type: "error", message: "Log in to manage budgets." });
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadBudgetData, loading, token]);

  useEffect(() => {
    if (!isFormOpen) return;
    const onKeyDown = (event) => { if (event.key === "Escape") setIsFormOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFormOpen]);

  const remainingBudget = Number(pick(summary, "RemainingBudget", "remainingBudget") || 0);
  const totalIncome = Number(pick(summary, "TotalBudget", "totalBudget") || 0);
  const totalExpenses = Number(pick(summary, "Amount", "amount") || 0);
  const activeAllocationTotal = budgets.reduce((total, budget) => {
    if (Boolean(pick(budget, "IsSpent", "isSpent"))) return total;
    const remaining = Number(pick(budget, "RemainingBudget", "remainingBudget") || 0);
    const allocated = Number(pick(budget, "TotalBudget", "totalBudget") || pick(budget, "Amount", "amount") || 0);
    return total + (remaining > 0 ? remaining : allocated);
  }, 0);
  const availableToAllocate = remainingBudget - activeAllocationTotal;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Number(form.Amount) <= 0) {
      setStatus({ type: "error", message: "Enter an allocation amount greater than zero." });
      return;
    }
    if (Number(form.Amount) > availableToAllocate) {
      setStatus({ type: "error", message: "Allocation exceeds your unallocated budget." });
      return;
    }
    try {
      setIsSaving(true);
      await postWithAuth("/api/budget", {
        Name: form.Name,
        Title: form.Name,
        Amount: Number(form.Amount),
        Category: form.Category,
        ExpectedDate: new Date(form.ExpectedDate).toISOString(),
        Description: form.Description,
      }, token);
      setForm(emptyBudgetForm);
      setStatus({ type: "success", message: "Budget allocation added." });
      setIsFormOpen(false);
      await loadBudgetData();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not add budget allocation." });
    } finally {
      setIsSaving(false);
    }
  };

  const markSpent = async (budgetId) => {
    try {
      setBusyId(budgetId);
      await postWithAuth(`/api/budget/${budgetId}/spent`, null, token);
      setStatus({ type: "success", message: "Allocation marked as spent and added as an expense." });
      await loadBudgetData();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not mark allocation as spent." });
    } finally {
      setBusyId("");
    }
  };

  const removeBudget = async (budgetId) => {
    try {
      setBusyId(budgetId);
      await deleteWithAuth(`/api/budget/${budgetId}`, token);
      setStatus({ type: "success", message: "Budget allocation removed." });
      await loadBudgetData();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not remove budget allocation." });
    } finally {
      setBusyId("");
    }
  };

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
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Budget</h1>
            <p className="text-sm leading-relaxed text-emerald-100/80 max-w-xl">
              Your current budget is calculated from income minus expenses, then planned allocations reserve money until they are spent or removed.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="self-start md:self-center inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-emerald-300 hover:scale-[1.02]"
          >
            <span>➕</span> Allocate Budget
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-emerald-300">{isLoading ? "…" : formatMoney(totalIncome)}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Total Income</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-rose-300">{isLoading ? "…" : formatMoney(totalExpenses)}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Total Expenses</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className={`text-2xl font-black ${remainingBudget >= 0 ? "text-cyan-300" : "text-rose-400"}`}>
              {isLoading ? "…" : formatMoney(remainingBudget)}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Remaining Budget</p>
          </div>
        </div>
      </section>

      {status.message ? (
        <p className={`rounded-lg px-4 py-3 text-sm font-medium ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {status.message}
        </p>
      ) : null}

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Budget allocations</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.14em] text-stone-400">
                <th className="py-3 pr-4">Purpose</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Expected</th>
                <th className="py-3 pr-4 text-right">Allocated</th>
                <th className="py-3 pr-4 text-right">Remaining</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Spent At</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((budget) => {
                const id = pick(budget, "Id", "id");
                const storedRemaining = Number(pick(budget, "RemainingBudget", "remainingBudget") || 0);
                const allocated = Number(pick(budget, "TotalBudget", "totalBudget") || pick(budget, "Amount", "amount") || 0);
                const spent = Boolean(pick(budget, "IsSpent", "isSpent"));
                const remaining = !spent && storedRemaining <= 0 ? allocated : storedRemaining;
                const spentAt = pick(budget, "SpentAt", "spentAt");
                const expenseId = pick(budget, "ExpenseId", "expenseId");
                return (
                  <tr key={id} className="border-b border-stone-100 text-stone-700">
                    <td className="py-3 pr-4 font-medium text-stone-950">{pick(budget, "Name", "name")}</td>
                    <td className="py-3 pr-4">{pick(budget, "Category", "category")}</td>
                    <td className="py-3 pr-4">{toDateInput(pick(budget, "ExpectedDate", "expectedDate"))}</td>
                    <td className="py-3 pr-4 text-right font-semibold">{formatMoney(pick(budget, "TotalBudget", "totalBudget"))}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-700">{formatMoney(remaining)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${spent ? "bg-stone-100 text-stone-600" : "bg-emerald-50 text-emerald-700"}`}>
                        {spent ? "Spent" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-stone-500">
                      {spentAt ? <span title={expenseId ? `Expense ID: ${expenseId}` : undefined}>{toDateInput(spentAt)}</span> : "-"}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => markSpent(id)} disabled={spent} className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50">
                          Mark as spent
                        </button>
                        <button type="button" onClick={() => removeBudget(id)} disabled={busyId === id} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50">
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!budgets.length ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-500">
                    No budget allocations found for {user?.Name ?? user?.name ?? "this user"}.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        aria-label="Allocate new budget"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:scale-105"
      >
        +
      </button>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4 py-8" onClick={() => setIsFormOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Allocate new budget"
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-stone-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Allocate new budget</p>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close" className="rounded-md px-2 py-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700">x</button>
            </div>
            <div className="mt-4">
              <BudgetAllocationForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                isSaving={isSaving}
                token={token}
                availableToAllocate={availableToAllocate}
              />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
