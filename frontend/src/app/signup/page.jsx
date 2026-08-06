"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { postAuth } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { getData as getCountries } from "country-list";
import { data as currenciesData } from "currency-codes";
import getCurrencySymbol from "currency-symbol-map";
import { SelectWithSearch } from "@/components/molecules";
import { StatusBanner } from "@/components/atoms";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load countries and currencies from packages
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    // Load countries from country-list package
    setCountries(getCountries());

    // Load currencies from currency-codes package
    const formattedCurrencies = currenciesData
      .filter((currency) => currency.code && currency.currency)
      .map((currency) => ({
        code: currency.code,
        name: currency.currency,
        symbol: getCurrencySymbol(currency.code) || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setCurrencies(formattedCurrencies);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      Object.values(form).some((value) => !String(value).trim()) ||
      Number(form.avgIncome) <= 0
    ) {
      setStatus({
        type: "error",
        message: "Please complete every field and enter an income greater than zero.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const backendPayload = {
        Name: form.name,
        Email: form.email,
        Password: form.password,
        Designation: form.designation,
        Workplace: form.workplace,
        HomeAddress: form.homeAddress,
        HomeCity: form.homeCity,
        Country: form.country,
        Currency: form.currency,
        IncomeAmount: Number(form.avgIncome),
      };

      const data = await postAuth("/auth/register", backendPayload);

      // Auto-login: persist the session returned by the register endpoint.
      login(data);

      setStatus({
        type: "success",
        message: "Account created! Redirecting to home...",
      });
      setForm(initialForm);
      console.log("Account created!");

      window.setTimeout(() => {
        router.push("/");
      }, 1500);
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

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  if (!countries.length || !currencies.length) {
    return (
      <main className="mx-auto w-full max-w-3xl py-10">
        <div className="h-40 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
      </main>
    );
  }

  return (
    <AuthFormTemplate
      kicker="Create Account"
      title="Sign up with the same fields your backend user model expects."
      subtitle="After the registration is successful, you will be able to experience so much special features."
      maxWidth="max-w-3xl"
    >
      <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Full Name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={handleInputChange("name")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="John Doe"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={handleInputChange("email")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="john@example.com"
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
            onChange={handleInputChange("password")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="At least 8 characters"
            minLength={8}
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
            onChange={handleInputChange("designation")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="Software Engineer"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Workplace
          </span>
          <input
            type="text"
            value={form.workplace}
            onChange={handleInputChange("workplace")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="Tech Corp"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Home Address
          </span>
          <input
            type="text"
            value={form.homeAddress}
            onChange={handleInputChange("homeAddress")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="123 Tech Street"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Home City
          </span>
          <input
            type="text"
            value={form.homeCity}
            onChange={handleInputChange("homeCity")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="San Francisco"
            required
          />
        </label>

        <SelectWithSearch
          label="Country"
          options={countries}
          value={form.country}
          onChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
          placeholder="Select your country"
          searchPlaceholder="Search country..."
          getOptionLabel={(opt) => opt.name}
          getOptionValue={(opt) => opt.name}
          required
        />

        <SelectWithSearch
          label="Currency"
          options={currencies}
          value={form.currency}
          onChange={(val) => setForm((prev) => ({ ...prev, currency: val }))}
          placeholder="Select your currency"
          searchPlaceholder="Search currency..."
          getOptionLabel={(opt) => `${opt.name} (${opt.code})${opt.symbol ? ` - ${opt.symbol}` : ""}`}
          getOptionValue={(opt) => opt.code}
          required
        />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800">
            Avg Monthly Income
          </span>
          <input
            type="number"
            value={form.avgIncome}
            onChange={handleInputChange("avgIncome")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
            placeholder="5000"
            min="0"
            step="0.01"
            required
          />
        </label>

        <StatusBanner
          type={status.type}
          message={status.message}
          variant="auth"
          className="md:col-span-2"
        />

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
    </AuthFormTemplate>
  );
}

const initialForm = {
  name: "",
  email: "",
  password: "",
  designation: "",
  workplace: "",
  homeAddress: "",
  homeCity: "",
  country: "",
  currency: "",
  avgIncome: "",
};

