"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Tiny stat card used inside the dashboard.
 */
function StatCard({ label, value, icon }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-900 break-all">{value}</p>
    </div>
  );
}

export default function ProfileDashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  // Redirect to login if not authenticated after rehydration.
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  // While the context is reading localStorage, show a subtle loader.
  if (loading || !user) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </main>
    );
  }

  const formattedIncome = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(user.avgIncome ?? user.AVGIncome ?? 0);

  return (
    <main className="w-full space-y-8 py-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500 p-8 text-white shadow-[0_20px_60px_rgba(5,150,105,0.25)] md:p-10">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-100">
              Your Profile
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">
              Welcome, {user.name}! 👋
            </h1>
            <p className="text-sm text-emerald-100 md:text-base">
              {user.designation} &nbsp;·&nbsp; {user.email}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-95"
          >
            Logout
          </button>
        </div>
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Full Name" value={user.name} icon="🧑" />
        <StatCard label="Email" value={user.email} icon="✉️" />
        <StatCard label="Designation" value={user.designation} icon="💼" />
        <StatCard label="Avg. Monthly Income" value={formattedIncome} icon="💰" />
      </section>

      {/* Quick actions */}
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Jump straight to the section you need.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {[
            { href: "/blog", label: "Read Latest Articles", icon: "📰", color: "bg-sky-50 border-sky-200 text-sky-800 hover:bg-sky-100" },
            { href: "/portfolio", label: "View Portfolio", icon: "📊", color: "bg-violet-50 border-violet-200 text-violet-800 hover:bg-violet-100" },
            { href: "/about", label: "About The Platform", icon: "ℹ️", color: "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100" },
          ].map(({ href, label, icon, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-semibold transition ${color}`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* Account info footer */}
      <section className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5 text-sm text-slate-500">
        <p>
          Signed in as <span className="font-semibold text-slate-700">{user.email}</span>.
          &nbsp;Your session is stored locally in your browser.&nbsp;
          <button
            onClick={handleLogout}
            className="font-semibold text-rose-500 underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </p>
      </section>
    </main>
  );
}
