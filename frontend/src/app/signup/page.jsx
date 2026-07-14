"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { postAuth } from "@/lib/authApi";
import { useAuth } from "@/context/AuthContext";
import { getData as getCountries } from "country-list";
import { data as currenciesData } from "currency-codes";
import getCurrencySymbol from "currency-symbol-map";

function SelectWithSearch({
  label,
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Search...",
  getOptionLabel,
  getOptionValue,
  className = "",
  required = false,
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter((opt) => {
    const searchTerm = search.toLowerCase();
    const label = getOptionLabel(opt).toLowerCase();
    const value = getOptionValue(opt).toLowerCase();
    return label.includes(searchTerm) || value.includes(searchTerm);
  });

  const handleOptionClick = (opt) => {
    onChange(getOptionValue(opt));
    setIsOpen(false);
    setSearch("");
  };

  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <div className="relative">
        <div
          className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent appearance-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-900">
              {value
                ? options.find((opt) => getOptionValue(opt) === value)
                  ? getOptionLabel(options.find((opt) => getOptionValue(opt) === value))
                  : value
                : placeholder}
            </span>
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-4 py-2 border-b border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-2 text-sm text-slate-500">No results found</p>
            ) : (
              filteredOptions.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  className="w-full px-4 py-2 text-left hover:bg-emerald-50 text-slate-900"
                >
                  {getOptionLabel(opt)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <input type="hidden" name="country" value={value} />
    </label>
  );
}

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

      const data = await postAuth("/api/auth/signup", backendPayload);

      // Auto-login: persist the session returned by the register endpoint.
      login(data);

      setStatus({
        type: "success",
        message: "Account created! Redirecting to your profile...",
      });
      setForm(initialForm);

      window.setTimeout(() => {
        router.push("/profile");
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
            After the registration is successful, you will be able to experience so much special features.
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
            getOptionValue={(opt) => opt.code}
            required
          />

          <SelectWithSearch
            label="Currency"
            options={currencies}
            value={form.currency}
            onChange={(val) => setForm((prev) => ({ ...prev, currency: val }))}
            placeholder="Select your currency"
            searchPlaceholder="Search currency..."
            getOptionLabel={(opt) => `${opt.symbol} ${opt.code} - ${opt.name}`}
            getOptionValue={(opt) => opt.code}
            required
          />

          <label className="block space-y-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-800">
              Monthly Income
            </span>
            <input
              type="number"
              value={form.avgIncome}
              onChange={handleInputChange("avgIncome")}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500"
              placeholder="85000"
              min="0.01"
              step="0.01"
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
