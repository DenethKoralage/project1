"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { deleteWithAuth, getWithAuth, postWithAuth } from "@/lib/authApi";
import { ExpensesPage } from "./expenses/ExpensesPage";

const incomeSources = [
  "Wages/Salary",
  "Freelancing & Contracting",
  "Self-Employment",
  "Dividends",
  "Interest",
  "Others",
];

const csvEscape = (value) => {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const emptyIncomeForm = {
  Amount: "",
  Source: "Wages/Salary",
  Category: "Primary Income",
  IncomeDate: new Date().toISOString().slice(0, 10),
  Description: "",
};

const emptyBudgetForm = {
  Name: "",
  Amount: "",
  Category: "Planned Spending",
  ExpectedDate: new Date().toISOString().slice(0, 10),
  Description: "",
};

const otherCategories = {
  expenses: {
    title: "Expenses",
    text: "Expense tracking will use your spending DTO and category filters.",
  },
  budget: {
    title: "Budget",
    text: "Budget planning will show targets, usage, and remaining balances.",
  },
  "my-blogs": {
    title: "My Blogs",
    text: "Your blog tools live in the blog workspace.",
    href: "/blog",
  },
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

function groupIncome(incomes, mode) {
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

  // For daily mode we key by the date-only string so same-day entries merge correctly
  const keyOf =
    mode === "daily"
      ? (date) => date.toISOString().slice(0, 10)
      : formatter;

  return incomes
    .reduce((groups, income) => {
      const date = new Date(pick(income, "IncomeDate", "incomeDate"));
      const key = keyOf(date);
      const label = formatter(date);
      const existing = groups.find((group) => group.key === key);
      const amount = Number(pick(income, "Amount", "amount") || 0);

      if (existing) {
        existing.amount += amount;
      } else {
        groups.push({ key, label, amount, time: date.getTime() });
      }

      return groups;
    }, [])
    .sort((a, b) => a.time - b.time);
}

function IncomeLineChart({ data }) {
  const width = 760;
  const height = 260;
  const padding = { top: 34, right: 28, bottom: 46, left: 58 };
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const denominator = Math.max(data.length - 1, 1);

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (index / denominator) * plotWidth;
    const y = padding.top + plotHeight - (item.amount / maxAmount) * plotHeight;
    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;
  const yTicks = [maxAmount, maxAmount / 2, 0];

  return (
    <div className="h-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full min-w-[680px] text-stone-500 z-100"
        role="img"
        aria-label="Income progress line chart"
      >
        <defs>
          <linearGradient id="incomeLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padding.top + plotHeight - (tick / maxAmount) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e7e5e4"
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="fill-stone-400 text-[11px]"
              >
                {formatMoney(tick)}
              </text>
            </g>
          );
        })}

        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={padding.top + plotHeight}
          stroke="#d6d3d1"
        />
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotHeight}
          y2={padding.top + plotHeight}
          stroke="#d6d3d1"
        />

        <path d={areaPath} fill="url(#incomeLineFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="#059669"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
        />

        {points.map((point) => (
          <g key={point.key ?? point.label}>
            <line
              x1={point.x}
              x2={point.x}
              y1={point.y}
              y2={padding.top + plotHeight}
              stroke="#d6d3d1"
              strokeDasharray="4 5"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              className="fill-white stroke-emerald-600"
              strokeWidth="4"
            />
            <text
              x={point.x}
              y={point.y - 14}
              textAnchor="middle"
              className="fill-stone-800 text-[12px] font-semibold"
            >
              {formatMoney(point.amount)}
            </text>
            <text
              x={point.x}
              y={padding.top + plotHeight + 26}
              textAnchor="middle"
              className="fill-stone-500 text-[12px]"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function IncomePage() {
  const { token, loading, user } = useAuth();
  const [incomes, setIncomes] = useState([]);
  const [form, setForm] = useState(emptyIncomeForm);
  const [chartMode, setChartMode] = useState("daily");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadIncomes = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await getWithAuth("/api/income", token);
      setIncomes(Array.isArray(data) ? data : []);
      setStatus({ type: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not load incomes.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (!loading && token) {
        loadIncomes();
      } else if (!loading && !token) {
        setIsLoading(false);
        setStatus({ type: "error", message: "Log in to manage income." });
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadIncomes, loading, token]);

  const filteredIncomes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return incomes;

    return incomes.filter((income) => {
      const source = String(pick(income, "Source", "source") || "").toLowerCase();
      const date = toDateInput(pick(income, "IncomeDate", "incomeDate"));
      return source.includes(term) || date.includes(term);
    });
  }, [incomes, search]);

  const chartData = useMemo(
    () => groupIncome(filteredIncomes, chartMode),
    [chartMode, filteredIncomes]
  );

  const totalIncome = filteredIncomes.reduce(
    (total, income) => total + Number(pick(income, "Amount", "amount") || 0),
    0
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Number(form.Amount) <= 0) {
      setStatus({ type: "error", message: "Enter an amount greater than zero." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      await postWithAuth(
        "/api/income",
        {
          Amount: Number(form.Amount),
          Source: form.Source,
          Category: form.Category,
          IncomeDate: new Date(form.IncomeDate).toISOString(),
          Description: form.Description,
        },
        token
      );
      setForm(emptyIncomeForm);
      setStatus({ type: "success", message: "Income added successfully." });
      setIsFormOpen(false);
      await loadIncomes();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not add income.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const header = ["Date", "Source", "Category", "Amount", "Description"];
    const rows = incomes.map((income) => {
      const date = toDateInput(pick(income, "IncomeDate", "incomeDate"));
      const source = pick(income, "Source", "source");
      const category = pick(income, "Category", "category");
      const amount = formatMoney(pick(income, "Amount", "amount"));
      const description = pick(income, "Description", "description") || "-";
      return [date, source, category, amount, description];
    });

    const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "incomes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Link href="/portfolio" className="text-sm font-semibold text-emerald-700">
            Portfolio
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Income</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Track received income by date and amount, filter progress monthly or
            annually, and keep each source searchable.
          </p>
        </div>
        <div className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
            Visible Total
          </p>
          <p className="mt-1 text-2xl font-bold text-stone-950">
            {formatMoney(totalIncome)}
          </p>
        </div>
      </div>

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

      <section className="grid gap-5">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Current income progress
              </p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">
                Received by date and amount
              </h2>
            </div>
            <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1">
              {["daily", "monthly", "annual"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold capitalize ${chartMode === mode
                    ? "bg-stone-950 text-white"
                    : "text-stone-600 hover:text-stone-950"
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-72 border-l border-b border-stone-200 px-3 pb-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">
                Loading income progress...
              </div>
            ) : chartData.length ? (
              <IncomeLineChart data={chartData} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-stone-500">
                No income records match this view.
              </div>
            )}
          </div>
        </div>

      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
              Income records
            </p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">
              Search by date or source
            </h2>
          </div>
          <select
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          >
            <option value="">All</option>
            {incomeSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="rounded-md border border-rose-500 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase tracking-[0.14em] text-stone-400">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Source</th>
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4 text-right">Amount</th>
                <th className="py-3">Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map((income) => (
                <tr
                  key={pick(income, "Id", "id")}
                  className="border-b border-stone-100 text-stone-700"
                >
                  <td className="py-3 pr-4">
                    {toDateInput(pick(income, "IncomeDate", "incomeDate"))}
                  </td>
                  <td className="py-3 pr-4 font-medium text-stone-950">
                    {pick(income, "Source", "source")}
                  </td>
                  <td className="py-3 pr-4">
                    {pick(income, "Category", "category")}
                  </td>
                  <td className="py-3 pr-4 text-right font-semibold text-emerald-700">
                    {formatMoney(pick(income, "Amount", "amount"))}
                  </td>
                  <td className="py-3 text-stone-500">
                    {pick(income, "Description", "description") || "-"}
                  </td>
                </tr>
              ))}
              {!filteredIncomes.length ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500">
                    No incomes found for {user?.Name ?? user?.name ?? "this user"}.
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
        aria-label="Add new income"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl font-semibold leading-none text-white shadow-lg transition hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        +
      </button>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 px-4 py-6 sm:items-center">
          <button
            type="button"
            aria-label="Close add income form"
            onClick={() => setIsFormOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label="Add new income"
            className="relative w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Add new income
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close add income form"
                className="flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-stone-500 transition hover:bg-stone-100 hover:text-stone-950"
              >
                &times;
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Amount</span>
                <input
                  name="Amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.Amount}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Source</span>
                <select
                  name="Source"
                  value={form.Source}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
                >
                  {incomeSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Category</span>
                <input
                  name="Category"
                  value={form.Category}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Income Date</span>
                <input
                  name="IncomeDate"
                  type="date"
                  value={form.IncomeDate}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-stone-700">Description</span>
                <textarea
                  name="Description"
                  value={form.Description}
                  onChange={handleChange}
                  maxLength={512}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
                />
              </label>

              <button
                type="submit"
                disabled={isSaving || !token}
                className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Adding..." : "Add Income"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function BudgetAllocationForm({
  form,
  onChange,
  onSubmit,
  isSaving,
  token,
  availableToAllocate,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Purpose</span>
        <input
          name="Name"
          value={form.Name}
          onChange={onChange}
          required
          maxLength={120}
          className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Amount</span>
        <input
          name="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.Amount}
          onChange={onChange}
          required
          className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Category</span>
        <input
          name="Category"
          value={form.Category}
          onChange={onChange}
          required
          maxLength={120}
          className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Expected Date</span>
        <input
          name="ExpectedDate"
          type="date"
          min={new Date().toISOString().slice(0, 10)}
          value={form.ExpectedDate}
          onChange={onChange}
          required
          className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-stone-700">Description</span>
        <textarea
          name="Description"
          value={form.Description}
          onChange={onChange}
          maxLength={512}
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500"
        />
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

function BudgetPage() {
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
      setStatus({
        type: "error",
        message: error.message || "Could not load budget details.",
      });
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

  // Close the modal on Escape
  useEffect(() => {
    if (!isFormOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setIsFormOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFormOpen]);

  const activeAllocationTotal = budgets.reduce(
    (total, budget) => {
      if (Boolean(pick(budget, "IsSpent", "isSpent"))) return total;

      const remaining = Number(pick(budget, "RemainingBudget", "remainingBudget") || 0);
      const allocated = Number(pick(budget, "TotalBudget", "totalBudget") || pick(budget, "Amount", "amount") || 0);
      return total + (remaining > 0 ? remaining : allocated);
    },
    0
  );
  const remainingBudget = Number(pick(summary, "RemainingBudget", "remainingBudget") || 0);
  const totalIncome = Number(pick(summary, "TotalBudget", "totalBudget") || 0);
  const totalExpenses = Number(pick(summary, "Amount", "amount") || 0);
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
      await postWithAuth(
        "/api/budget",
        {
          Name: form.Name,
          Title: form.Name,
          Amount: Number(form.Amount),
          Category: form.Category,
          ExpectedDate: new Date(form.ExpectedDate).toISOString(),
          Description: form.Description,
        },
        token
      );
      setForm(emptyBudgetForm);
      setStatus({ type: "success", message: "Budget allocation added." });
      setIsFormOpen(false);
      await loadBudgetData();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not add budget allocation.",
      });
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
      setStatus({
        type: "error",
        message: error.message || "Could not mark allocation as spent.",
      });
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
      setStatus({
        type: "error",
        message: error.message || "Could not remove budget allocation.",
      });
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <Link href="/portfolio" className="text-sm font-semibold text-emerald-700">
            Portfolio
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Budget</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Your current budget is calculated from income minus expenses, then
            planned allocations reserve money until they are spent or removed.
          </p>
        </div>
      </div>

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

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Total income", totalIncome],
          ["Total expenses", totalExpenses],
          ["Remaining budget", remainingBudget],
          ["Unallocated", availableToAllocate],
        ].map(([label, value]) => (
          <article key={label} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-stone-950">
              {isLoading ? "..." : formatMoney(value)}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          Budget allocations
        </p>
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
                    <td className="py-3 pr-4 font-medium text-stone-950">
                      {pick(budget, "Name", "name")}
                    </td>
                    <td className="py-3 pr-4">{pick(budget, "Category", "category")}</td>
                    <td className="py-3 pr-4">
                      {toDateInput(pick(budget, "ExpectedDate", "expectedDate"))}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">
                      {formatMoney(pick(budget, "TotalBudget", "totalBudget"))}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-700">
                      {formatMoney(remaining)}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${spent
                        ? "bg-stone-100 text-stone-600"
                        : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {spent ? "Spent" : "Active"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-stone-500">
                      {spentAt ? (
                        <span title={expenseId ? `Expense ID: ${expenseId}` : undefined}>
                          {toDateInput(spentAt)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => markSpent(id)}
                          disabled={spent}
                          className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Mark as spent
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBudget(id)}
                          disabled={busyId === id}
                          className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
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

      {/* Floating action button, bottom right, opens the allocation form as a modal */}
      <button
        type="button"
        onClick={() => setIsFormOpen(true)}
        aria-label="Allocate new budget"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-semibold text-white shadow-lg transition hover:bg-emerald-700 hover:scale-105"
      >
        +
      </button>

      {isFormOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4 py-8"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Allocate new budget"
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-md overflow-y-auto rounded-lg border border-stone-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                Allocate new budget
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close"
                className="rounded-md px-2 py-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                x
              </button>
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

function PlaceholderCategory({ category }) {
  const detail = otherCategories[category];

  if (!detail) {
    return (
      <main className="mx-auto w-full max-w-3xl py-10">
        <h1 className="text-3xl font-bold text-stone-950">Category not found</h1>
        <Link href="/portfolio" className="mt-4 inline-flex text-sm font-semibold text-emerald-700">
          Back to portfolio
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 py-10">
      <Link href="/portfolio" className="text-sm font-semibold text-emerald-700">
        Portfolio
      </Link>
      <h1 className="text-3xl font-bold text-stone-950">{detail.title}</h1>
      <p className="text-sm leading-6 text-stone-600">{detail.text}</p>
      {detail.href ? (
        <Link
          href={detail.href}
          className="inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
        >
          Open
        </Link>
      ) : null}
    </main>
  );
}

export default function PortfolioCategoryPage({ params }) {
  const { category } = use(params);

  if (category === "income") {
    return <IncomePage />;
  }

  if (category === "expenses") {
    return <ExpensesPage />;
  }

  if (category === "budget") {
    return <BudgetPage />;
  }

  return <PlaceholderCategory category={category} />;
}
