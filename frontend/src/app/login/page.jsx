"use client";

import Link from "next/link";
import { useState } from "react";
import { postAuth } from "@/lib/authApi";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await postAuth("/auth/login", {
        email: form.email,
        password: form.password,
      });

      setStatus({
        type: "success",
        message: `${data.user.name}, you are signed in as ${data.user.designation}.`,
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to sign you in.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl py-10">
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Welcome Back
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Login to continue tracking your financial profile.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
            This form matches the backend login payload and submits your
            registered email and password to the API.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Password
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              placeholder="Enter your password"
              minLength={6}
              required
            />
          </label>

          {status.message ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                status.type === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Login"}
            </button>

            <Link
              href="/signup"
              className="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
            >
              Need an account? Sign up
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
