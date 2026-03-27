"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { getToken, setAuth } from "@/lib/auth";

const initialForm = {
  fullName: "",
  designation: "",
  email: "",
  password: "",
  confirmPassword: "",
  avgIncome: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("Full name, email, and password are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
          fullName: form.fullName.trim(),
          designation: form.designation.trim(),
          email: form.email.trim(),
          password: form.password,
          avgIncome: Number(form.avgIncome || 0),
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
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -right-12 top-10 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-52 w-52 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              Join The Financial Freedom
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Create your account and start tracking smarter money habits.
            </h1>
            <p className="max-w-lg text-base leading-7 text-slate-700">
              Set up your profile, record your average income, and use your
              dashboard to build a more intentional plan.
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/50 bg-white/65 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Personalized profile
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Save your name, role, and monthly income in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-white/50 bg-white/65 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  Expense planning
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Keep track of monthly expenses and review spending patterns.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Fill in your details to get started.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Full name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="designation"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Designation
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Student, Designer, Engineer"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="avgIncome"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Average monthly income
                </label>
                <input
                  id="avgIncome"
                  name="avgIncome"
                  type="number"
                  min="0"
                  value={form.avgIncome}
                  onChange={handleChange}
                  placeholder="0"
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
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-600">Already registered?</p>
              <Link
                href="/dashboard/login"
                className="font-semibold text-emerald-700 transition hover:text-emerald-800"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
