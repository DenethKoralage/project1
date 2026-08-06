"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAuth } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { AuthFormTemplate } from "@/components/templates";
import { StatusBanner } from "@/components/atoms";

const initialForm = {
  email: "",
  password: "",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const data = await postAuth("/auth/login", {
        Email: form.email,
        Password: form.password,
      });

      // Persist the session so the whole app knows who is logged in.
      login(data);

      setStatus({
        type: "success",
        message: `Welcome back, ${data.user.Name}! Redirecting...`,
      });
      setForm(initialForm);

      // Redirect to the profile page after a short delay.
      window.setTimeout(() => {
        router.push("/");
      }, 800);
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
    <AuthFormTemplate
      kicker="Welcome Back"
      title="Login to continue tracking your financial profile."
      subtitle="This form matches the backend login payload and submits your registered email and password to the API."
    >
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
            minLength={8}
            required
          />
        </label>

        <StatusBanner type={status.type} message={status.message} variant="auth" />

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
    </AuthFormTemplate>
  );
}

