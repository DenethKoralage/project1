"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/lib/authApi";
import { PortfolioHeroCard } from "@/components/organisms";
import { PortfolioSubpageTemplate } from "@/components/templates";
import { StatusBanner } from "@/components/atoms";
import { pick } from "@/utils/pick";
import { formatMoney } from "@/utils/formatMoney";
import { toDateInput } from "@/utils/toDateInput";

const emptyBudgetForm = {
  Name: "",
  Amount: "",
  Category: "Planned Spending",
  ExpectedDate: new Date().toISOString().slice(0, 10),
  Description: "",
};

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
    <PortfolioSubpageTemplate
      heroSlot={
        <PortfolioHeroCard
          title="Budget"
          description="Your current budget is calculated from income minus expenses, then planned allocations reserve money until they are spent or removed."
          backHref="/portfolio"
          stats={[
            { value: isLoading ? "…" : formatMoney(totalIncome), label: "Total Income", valueClassName: "text-emerald-300" },
            { value: isLoading ? "…" : formatMoney(totalExpenses), label: "Total Expenses", valueClassName: "text-rose-300" },
            {
              value: isLoading ? "…" : formatMoney(remainingBudget),
              label: "Remaining Budget",
              valueClassName: remainingBudget >= 0 ? "text-cyan-300" : "text-rose-400",
            },
          ]}
          actionLabel="Allocate Budget"
          onAction={() => setIsFormOpen(true)}
        />
      }
      statusSlot={
        <StatusBanner type={status.type} message={status.message} variant="portfolio" />
      }
    >

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
    </PortfolioSubpageTemplate>
  );
}
