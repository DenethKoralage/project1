"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAuth } from "@/lib/authApi";

const initialForm = {
  name: "",
  email: "",
  password: "",
  designation: "",
  avgIncome: "",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await postAuth("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        designation: form.designation,
        avgIncome: Number(form.avgIncome),
      });

      setStatus({
        type: "success",
        message: "Account created. Redirecting you to login...",
      });
      setForm(initialForm);

      window.setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "Unable to create account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl py-10">
      <section className="rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-emerald-50 p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Create Account
          </p>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Sign up with the same fields your backend user model expects.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            The registration form sends `name`, `email`, `password`,
            `designation`, and `avgIncome`, which matches the current API shape.
          </p>
        </div>

        <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Full Name
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="Jane Doe"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="jane@example.com"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-800">
              Designation
            </span>
            <input
              type="text"
              value={form.designation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  designation: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="Software Engineer"
              required
            />
          </label>

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              Average Monthly Income
            </span>
            <input
              type="number"
              value={form.avgIncome}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  avgIncome: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="85000"
              min="0"
              step="1"
              required
            />
          </label>

          {status.message ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm md:col-span-2 ${
                status.type === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating Account..." : "Sign Up"}
            </button>

            <Link
              href="/login"
              className="text-sm font-semibold text-sky-700 underline-offset-4 hover:underline"
            >
              Already registered? Login
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
