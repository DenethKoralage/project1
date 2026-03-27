"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getToken, setAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleLogin(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: {
          email: email.trim(),
          password,
        },
      });

      setAuth(response.token, response.user);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -left-10 top-12 h-44 w-44 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-52 w-52 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              Welcome Back
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Sign in and get back to your money dashboard.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-700">
              Track expenses, review your profile, and keep your financial plan
              moving without losing momentum.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/50 bg-white/65 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Account tools
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Manage your profile and update income details anytime.
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/65 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Finance tracking
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Add expenses and keep an eye on upcoming monthly predictions.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Login</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@email.com"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-600">Need an account?</p>
              <Link
                href="/dashboard/register"
                className="font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Create one here
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
