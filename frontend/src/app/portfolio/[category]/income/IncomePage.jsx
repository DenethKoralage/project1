"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getWithAuth, postWithAuth } from "@/lib/authApi";

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

const isDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

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
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef(null);

  const baseWidth = 760;
  const height = 260;
  const minWidth = Math.max(720, Math.round(720 * zoomScale));

  const padding = { top: 34, right: 28, bottom: 46, left: 58 };
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const plotWidth = baseWidth - padding.left - padding.right;
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

  const handleZoomIn = () => setZoomScale((prev) => Math.min(3.0, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoomScale(1);

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const amount = direction === "left" ? -250 : 250;
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <span>🔍</span> Zoom:
          </span>
          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded min-w-[50px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 active:scale-95 transition shadow-sm"
              title="Pan Left"
            >
              ◀ Left
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 active:scale-95 transition shadow-sm"
              title="Pan Right"
            >
              Right ▶
            </button>
          </div>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 0.75}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 active:scale-95 disabled:opacity-40 transition shadow-sm"
            title="Zoom Out"
          >
            - Zoom Out
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 3.0}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700 active:scale-95 disabled:opacity-40 transition shadow-sm"
            title="Zoom In"
          >
            + Zoom In
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            disabled={zoomScale === 1}
            className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-stone-200 font-semibold text-stone-700 hover:bg-stone-300 active:scale-95 disabled:opacity-40 transition"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-xl border border-stone-200 bg-white p-3 shadow-sm [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-emerald-400"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#6ee7b7 #f5f5f4" }}
      >
        <div style={{ width: `${minWidth}px`, minWidth: `${minWidth}px` }}>
          <svg
            viewBox={`0 0 ${baseWidth} ${height}`}
            className="w-full h-auto text-stone-500 block"
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
                  <line x1={padding.left} x2={baseWidth - padding.right} y1={y} y2={y} stroke="#e7e5e4" />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-stone-400 text-[11px]">
                    {formatMoney(tick)}
                  </text>
                </g>
              );
            })}

            <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#d6d3d1" />
            <line x1={padding.left} x2={baseWidth - padding.right} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#d6d3d1" />

            <path d={areaPath} fill="url(#incomeLineFill)" />
            <path d={linePath} fill="none" stroke="#059669" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

            {points.map((point) => (
              <g key={point.key ?? point.label}>
                <line x1={point.x} x2={point.x} y1={point.y} y2={padding.top + plotHeight} stroke="#d6d3d1" strokeDasharray="4 5" />
                <circle cx={point.x} cy={point.y} r="6" className="fill-white stroke-emerald-600" strokeWidth="4" />
                <text x={point.x} y={point.y - 14} textAnchor="middle" className="fill-stone-800 text-[12px] font-semibold">
                  {formatMoney(point.amount)}
                </text>
                <text x={point.x} y={padding.top + plotHeight + 26} textAnchor="middle" className="fill-stone-500 text-[12px]">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 font-medium">
        <span>↔ Swipe or use ◀ ▶ buttons to scroll chart</span>
        <span>Width: {minWidth}px ({Math.round(zoomScale * 100)}%)</span>
      </div>
    </div>
  );
}

export function IncomePage() {
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
      setStatus({ type: "error", message: error.message || "Could not load incomes." });
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

  const chartData = useMemo(() => groupIncome(filteredIncomes, chartMode), [chartMode, filteredIncomes]);

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
      await postWithAuth("/api/income", {
        Amount: Number(form.Amount),
        Source: form.Source,
        Category: form.Category,
        IncomeDate: new Date(form.IncomeDate).toISOString(),
        Description: form.Description,
      }, token);
      setForm(emptyIncomeForm);
      setStatus({ type: "success", message: "Income added successfully." });
      setIsFormOpen(false);
      await loadIncomes();
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not add income." });
    } finally {
      setIsSaving(false);
    }
  };

  const searchDate = (date) => setSearch(date);

  const handleExport = () => {
    const header = ["Date", "Source", "Category", "Amount", "Description"];
    const rows = incomes.map((income) => {
      const date = toDateInput(pick(income, "IncomeDate", "incomeDate"));
      const source = pick(income, "Source", "source");
      const category = pick(income, "Category", "category");
      const amount = Number(pick(income, "Amount", "amount") || 0);
      const description = pick(income, "Description", "description") || "-";
      return [date, source, category, amount, description];
    });
    const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "incomes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lastEntry = filteredIncomes.length
    ? filteredIncomes.reduce((latest, inc) => {
        const d = new Date(pick(inc, "IncomeDate", "incomeDate"));
        return d > latest ? d : latest;
      }, new Date(0))
    : null;

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
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">Income</h1>
            <p className="text-sm leading-relaxed text-emerald-100/80 max-w-xl">
              Track received income by date and amount, filter progress monthly or annually, and keep each source searchable.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="self-start md:self-center inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-emerald-300 hover:scale-[1.02]"
          >
            <span>➕</span> Add Income
          </button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-emerald-300">{filteredIncomes.length}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Records</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-cyan-300">{isLoading ? "…" : formatMoney(totalIncome)}</p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Visible Total</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
            <p className="text-2xl font-black text-amber-300">
              {lastEntry ? lastEntry.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-slate-300">Last Entry</p>
          </div>
        </div>
      </section>

      {status.message ? (
        <p className={`rounded-lg px-4 py-3 text-sm font-medium ${status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
          {status.message}
        </p>
      ) : null}

      <section className="grid gap-5 min-w-0">
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Current income progress</p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">Received by date and amount</h2>
            </div>
            <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1">
              {["daily", "monthly", "annual"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`rounded px-3 py-1.5 text-sm font-semibold capitalize ${chartMode === mode ? "bg-stone-950 text-white" : "text-stone-600 hover:text-stone-950"}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 w-full min-w-0">
            {isLoading ? (
              <div className="flex h-[260px] items-center justify-center text-sm text-stone-500">Loading income progress...</div>
            ) : chartData.length ? (
              <IncomeLineChart data={chartData} />
            ) : (
              <div className="flex h-[260px] items-center justify-center text-sm text-stone-500">No income records match this view.</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Income records</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-950">Search by date or source</h2>
          </div>
          <select
            value={isDateString(search) ? "" : search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          >
            <option value="">All</option>
            {incomeSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
          <input
            type="date"
            name="searchDate"
            value={isDateString(search) ? search : ""}
            onChange={(e) => searchDate(e.target.value)}
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 shadow-sm outline-none transition-colors focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
          />
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
                <tr key={pick(income, "Id", "id")} className="border-b border-stone-100 text-stone-700">
                  <td className="py-3 pr-4">{toDateInput(pick(income, "IncomeDate", "incomeDate"))}</td>
                  <td className="py-3 pr-4 font-medium text-stone-950">{pick(income, "Source", "source")}</td>
                  <td className="py-3 pr-4">{pick(income, "Category", "category")}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-emerald-700">{formatMoney(pick(income, "Amount", "amount"))}</td>
                  <td className="py-3 text-stone-500">{pick(income, "Description", "description") || "-"}</td>
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
          <button type="button" aria-label="Close add income form" onClick={() => setIsFormOpen(false)} className="absolute inset-0 cursor-default" />
          <form
            onSubmit={handleSubmit}
            role="dialog"
            aria-modal="true"
            aria-label="Add new income"
            className="relative w-full max-w-md rounded-lg border border-stone-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Add new income</p>
              <button type="button" onClick={() => setIsFormOpen(false)} aria-label="Close add income form" className="flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-stone-500 transition hover:bg-stone-100 hover:text-stone-950">
                &times;
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Amount</span>
                <input name="Amount" type="number" min="0.01" step="0.01" value={form.Amount} onChange={handleChange} required className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Source</span>
                <select name="Source" value={form.Source} onChange={handleChange} required className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-emerald-500">
                  {incomeSources.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Category</span>
                <input name="Category" value={form.Category} onChange={handleChange} required maxLength={120} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Income Date</span>
                <input name="IncomeDate" type="date" value={form.IncomeDate} onChange={handleChange} required className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-stone-700">Description</span>
                <textarea name="Description" value={form.Description} onChange={handleChange} maxLength={512} rows={3} className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-emerald-500" />
              </label>
              <button type="submit" disabled={isSaving || !token} className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                {isSaving ? "Adding..." : "Add Income"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
