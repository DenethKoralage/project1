"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const categories = [
  {
    href: "/portfolio/income",
    name: "Income",
    kicker: "Track receiving progress",
    description:
      "Record salary, freelancing, dividends, interest, and other income while watching progress by date and amount.",
    metric: "Monthly / Annual",
  },
  {
    href: "/portfolio/expenses",
    name: "Expenses",
    kicker: "Control spending",
    description:
      "Review outgoing money by category, date, and amount so spending patterns stay visible.",
    metric: "Track spending",
  },
  {
    href: "/portfolio/budget",
    name: "Budget",
    kicker: "Plan allocations",
    description:
      "View income minus expenses, reserve money for planned purposes, and convert spent allocations into expenses.",
    metric: "Live budget",
  },
  {
    href: "/portfolio/my-blogs",
    name: "My Blogs",
    kicker: "Write and review",
    description:
      "Keep personal finance notes, lessons, and ideas connected to your money habits.",
    metric: "Open blog",
  },
];

const quickLinks = [
  { label: "Add Income", href: "/portfolio/income", icon: "➕" },
  { label: "Log Expense", href: "/portfolio/expenses", icon: "💸" },
  { label: "View Budget", href: "/portfolio/budget", icon: "📊" },
  { label: "Write Blog", href: "/portfolio/my-blogs?compose=1", icon: "✍️" },
];

const stats = [
  { label: "Total Sections", value: "4", icon: "🗂️", color: "#10b981" },
  { label: "Active Tracking", value: "Live", icon: "📡", color: "#6366f1" },
  { label: "Finance Notes", value: "Blog", icon: "📝", color: "#f59e0b" },
  { label: "Budget Status", value: "On Track", icon: "✅", color: "#3b82f6" },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (isNaN(target)) return;
    let start = 0;
    const duration = 1200;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  if (isNaN(target)) return <span>{target}{suffix}</span>;
  return <span>{count}{suffix}</span>;
}

export default function PortfolioPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 py-10">

      {/* ── HERO SECTION ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f2027 100%)",
          borderRadius: "16px",
          padding: "0",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(16,185,129,0.18)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.45)",
        }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: "absolute", top: "-60px", right: "-60px", width: "260px", height: "260px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-40px", left: "30%", width: "180px", height: "180px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "20px", left: "-30px", width: "120px", height: "120px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Subtle grid pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, padding: "36px 40px 32px" }}>

          {/* Badge + Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)",
                borderRadius: "20px", padding: "4px 14px",
                fontSize: "11px", fontWeight: "700", letterSpacing: "0.18em",
                color: "#34d399", textTransform: "uppercase",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#34d399", display: "inline-block", animation: "pulse 2s infinite" }} />
                Portfolio
              </span>

              <h1 style={{
                marginTop: "14px", fontSize: "clamp(24px,3vw,38px)", fontWeight: "800",
                color: "#f8fafc", lineHeight: 1.2, letterSpacing: "-0.02em",
              }}>
                Financial <span style={{ color: "#34d399" }}>Workspace</span>
              </h1>

              <p style={{ marginTop: "10px", maxWidth: "480px", fontSize: "14px", lineHeight: "1.7", color: "#94a3b8" }}>
                Move between the four main areas of your money system: income, expenses, budget, and your finance writing.
              </p>
            </div>

            {/* Mini clock / date badge */}
            <div style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", padding: "12px 18px", textAlign: "right", minWidth: "130px",
            }}>
              <p style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.1em" }}>Today</p>
              <p style={{ fontSize: "16px", color: "#f1f5f9", fontWeight: "700", marginTop: "4px" }}>
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <p style={{ fontSize: "12px", color: "#34d399", marginTop: "4px" }}>
                {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px", marginTop: "28px",
          }}>
            {stats.map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px", padding: "14px 16px",
                display: "flex", alignItems: "center", gap: "12px",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                <span style={{ fontSize: "22px" }}>{s.icon}</span>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: "700", color: s.color }}>
                    {s.value}
                  </p>
                  <p style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick-access bar */}
          <div style={{
            marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center",
          }}>
            <span style={{ fontSize: "11px", fontWeight: "600", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginRight: "4px" }}>
              Quick →
            </span>
            {quickLinks.map((ql) => (
              <Link key={ql.label} href={ql.href} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "6px 14px",
                fontSize: "12px", fontWeight: "600", color: "#cbd5e1",
                textDecoration: "none", transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.15)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.4)"; e.currentTarget.style.color = "#34d399"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#cbd5e1"; }}
              >
                <span>{ql.icon}</span>
                {ql.label}
              </Link>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </section>

      {/* ── CATEGORY CARDS ── */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <article
            key={category.name}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              {category.kicker}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              {category.name}
            </h2>
            <p className="mt-3 min-h-24 text-sm leading-6 text-stone-600">
              {category.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-emerald-700">
                {category.metric}
              </p>
              <Link
                href={category.href}
                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Open
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
