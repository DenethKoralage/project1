"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getWithAuth, putWithAuth } from "@/lib/authApi";
import { getData as getCountries } from "country-list";
import { data as currenciesData } from "currency-codes";
import getCurrencySymbol from "currency-symbol-map";

/**
 * Tolerant field reader: the backend UserDto uses PascalCase
 * (Name, Email, AVGIncome, ...). We also fall back to the
 * camelCase keys so the UI keeps working if the source differs.
 */
const pick = (u, pascal, camel) =>
  u?.[pascal] ?? u?.[camel] ?? "";

const getUserId = (user) => user?.Id ?? user?.id;

const decodeJwtPayload = (token) => {
  try {
    const payload = token?.split(".")?.[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getTokenUserId = (token) => {
  const payload = decodeJwtPayload(token);
  return (
    payload?.sub ??
    payload?.nameid ??
    payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ]
  );
};

const countryOptions = getCountries().sort((a, b) => a.name.localeCompare(b.name));

const currencyOptions = currenciesData
  .filter((currency) => currency.code && currency.currency)
  .map((currency) => ({
    code: currency.code,
    name: currency.currency,
    symbol: getCurrencySymbol(currency.code) || currency.code,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const findCountry = (value) => {
  if (!value) return null;
  return countryOptions.find(
    (country) => country.code === value || country.name === value
  );
};

const findCurrency = (value) => {
  if (!value) return null;
  return currencyOptions.find((currency) => currency.code === value);
};

const getCountryValue = (user) => {
  const country = pick(user, "Country", "country");
  return findCountry(country)?.code ?? country;
};

const getCountryLabel = (value) => findCountry(value)?.name ?? value;

const getCurrencyLabel = (value) => {
  const currency = findCurrency(value);
  return currency
    ? `${currency.symbol} ${currency.code} - ${currency.name}`
    : value;
};

const getMonthlyIncome = (user) => {
  const directIncome = pick(user, "IncomeAmount", "incomeAmount") ||
    pick(user, "AVGIncome", "avgIncome");

  if (directIncome) {
    return directIncome;
  }

  const incomes = user?.Incomes ?? user?.incomes ?? [];
  return incomes.reduce((total, income) => {
    return total + Number(income?.Amount ?? income?.amount ?? 0);
  }, 0);
};

const buildEditForm = (user) => ({
  Name: pick(user, "Name", "name"),
  Email: pick(user, "Email", "email"),
  Designation: pick(user, "Designation", "designation"),
  Workplace: pick(user, "Workplace", "workplace"),
  HomeAddress: pick(user, "HomeAddress", "homeAddress"),
  HomeCity: pick(user, "HomeCity", "homeCity"),
  Country: getCountryValue(user),
  Currency: user?.Currency ?? user?.currency ?? "",
  IncomeAmount: getMonthlyIncome(user),
});

function LedgerRow({ label, value, accent = false }) {
  return (
    <div className="flex items-baseline gap-3 py-3">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">
        {label}
      </span>
      <span aria-hidden="true" className="h-px flex-1 border-b border-dotted border-stone-300" />
      <span
        className={`shrink-0 break-all font-mono text-sm ${
          accent ? "font-semibold text-emerald-700" : "text-stone-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, token, logout, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: "",
    Email: "",
    Designation: "",
    Workplace: "",
    HomeAddress: "",
    HomeCity: "",
    Country: "",
    Currency: "",
    IncomeAmount: "",
  });
  const [updateStatus, setUpdateStatus] = useState({ type: "", message: "" });

  // Redirect to login if not authenticated after rehydration.
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [loading, authUser, router]);

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const userId = getTokenUserId(token) ?? getUserId(authUser);
      if (!userId) throw new Error("Missing logged-in user id");

      const u = await getWithAuth(`/api/user/${userId}`, token);
      setProfile(u);
      setEditForm(buildEditForm(u));
      setProfileError("");
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setProfileError("Could not load your profile from the backend. Please log in again.");
    } finally {
      setProfileLoading(false);
    }
  }, [authUser, token]);

  // Fetch the latest profile from the .NET backend.
  useEffect(() => {
    if (!loading && authUser && token) {
      const loadProfile = async () => {
        await fetchProfile();
      };

      loadProfile();
    }
  }, [loading, authUser, token, fetchProfile]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateStatus({ type: "pending", message: "Updating profile..." });
    try {
      const userId = getTokenUserId(token) ?? getUserId(displayUser);
      if (!userId) throw new Error("Missing logged-in user id");

      const payload = {
        Name: editForm.Name,
        Email: editForm.Email,
        Designation: editForm.Designation,
        Workplace: editForm.Workplace,
        HomeAddress: editForm.HomeAddress,
        HomeCity: editForm.HomeCity,
        Country: editForm.Country,
        Currency: editForm.Currency,
      };

      await putWithAuth(`/api/user/${userId}`, payload, token);
      const updatedProfile = await getWithAuth(`/api/user/${userId}`, token);
      setProfile(updatedProfile);
      setEditForm(buildEditForm(updatedProfile));
      setEditMode(false);
      setUpdateStatus({ type: "success", message: "Profile updated successfully!" });
      setTimeout(() => setUpdateStatus({ type: "", message: "" }), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setUpdateStatus({
        type: "error",
        message: error.message || "Failed to update profile",
      });
    }
  };

  if (loading || (!authUser && !profile)) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-6 py-10">
        <div className="h-40 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
        <div className="h-56 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="mx-auto w-full max-w-3xl py-10">
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-8 py-6 text-rose-800">
          <p className="font-semibold">Profile unavailable</p>
          <p className="mt-2 text-sm">{profileError}</p>
          <button
            onClick={handleLogout}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Log in again
          </button>
        </section>
      </main>
    );
  }

  if (profileLoading || !profile) {
    return (
      <main className="mx-auto w-full max-w-3xl space-y-6 py-10">
        <div className="h-40 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
        <div className="h-56 animate-pulse rounded-3xl bg-stone-100 motion-reduce:animate-none" />
      </main>
    );
  }

  const displayUser = profile;

  const name = pick(displayUser, "Name", "name") || "User";
  const designation = pick(displayUser, "Designation", "designation");
  const currency = displayUser?.Currency || displayUser?.currency || "USD";
  const avgIncome =
    getMonthlyIncome(displayUser) || 0;

  const formattedIncome = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(avgIncome));

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  /*
  const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France",
    "Australia", "India", "Brazil", "Japan", "China", "Sweden",
    "Netherlands", "Spain", "Italy", "Switzerland",
  ];
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "BRL", symbol: "R$", name: "Brazilian Real" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
  ];
  */

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 py-10">
      {/* Badge header */}
      <section className="relative rounded-3xl border border-stone-200 bg-stone-900 px-8 pb-9 pt-8 text-stone-50">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-lg font-bold tracking-wide text-emerald-400 ring-1 ring-inset ring-emerald-400/30">
              {initials}
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
                Profile
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">{name}</h1>
              <p className="mt-0.5 font-mono text-xs text-stone-400">{designation}</p>
            </div>
          </div>

          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95"
            >
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogout}
            className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:scale-95"
          >
            Log out
          </button>
        </div>

        <div className="pointer-events-none absolute -bottom-3 left-0 right-0 flex justify-between px-4">
          <span className="h-6 w-6 -translate-x-1/2 rounded-full bg-stone-50" />
          <span className="h-6 w-6 translate-x-1/2 rounded-full bg-stone-50" />
        </div>
      </section>

      {/* Edit form */}
      {editMode && (
        <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            Edit Profile
          </h2>

          {updateStatus.message && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
                updateStatus.type === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : updateStatus.type === "error"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {updateStatus.message}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="Name"
                  value={editForm.Name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                <input
                  type="email"
                  name="Email"
                  value={editForm.Email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="Designation"
                  value={editForm.Designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Workplace</label>
                <input
                  type="text"
                  name="Workplace"
                  value={editForm.Workplace}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Home Address</label>
                <input
                  type="text"
                  name="HomeAddress"
                  value={editForm.HomeAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Home City</label>
                <input
                  type="text"
                  name="HomeCity"
                  value={editForm.HomeCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Country</label>
                <select
                  name="Country"
                  value={editForm.Country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="" disabled>Select your country</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Currency</label>
                <select
                  name="Currency"
                  value={editForm.Currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border text-stone-400 border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="" disabled>Select your currency</option>
                  {currencyOptions.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Average Monthly Income</label>
                <input
                  type="number"
                  name="IncomeAmount"
                  value={editForm.IncomeAmount}
                  disabled
                  min="0"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-stone-100 text-stone-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {profileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* View mode */}
      {!editMode && (
        <>
          <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Account details
            </h2>
            <div className="mt-2 divide-y divide-stone-100">
              <LedgerRow label="Full name" value={name} />
              <LedgerRow label="Email" value={pick(displayUser, "Email", "email")} />
              <LedgerRow label="Designation" value={designation} />
              <LedgerRow label="Workplace" value={pick(displayUser, "Workplace", "workplace")} />
              <LedgerRow label="Home address" value={pick(displayUser, "HomeAddress", "homeAddress")} />
              <LedgerRow label="Home city" value={pick(displayUser, "HomeCity", "homeCity")} />
              <LedgerRow label="Country" value={getCountryLabel(pick(displayUser, "Country", "country"))} />
              <LedgerRow label="Currency" value={getCurrencyLabel(currency)} />
              <LedgerRow label="Avg. monthly income" value={formattedIncome} accent />
              {pick(displayUser, "CreatedAt", "createdAt") && (
                <LedgerRow
                  label="Member since"
                  value={new Date(pick(displayUser, "CreatedAt", "createdAt")).toLocaleDateString()}
                />
              )}
              {pick(displayUser, "UpdatedAt", "updatedAt") && (
                <LedgerRow
                  label="Last updated"
                  value={new Date(pick(displayUser, "UpdatedAt", "updatedAt")).toLocaleString()}
                />
              )}
            </div>
          </section>

          {displayUser?.skills?.length > 0 && (
            <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {displayUser.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {displayUser?.bio && (
            <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">About Me</h2>
              <p className="mt-4 text-stone-700 leading-relaxed">{displayUser.bio}</p>
            </section>
          )}

          {displayUser?.socialLinks &&
            Object.values(displayUser.socialLinks).some((v) => v) && (
              <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Connect With Me
                </h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {Object.entries(displayUser.socialLinks).map(([platform, url]) => {
                    if (!url) return null;
                    const map = {
                      github: ["⚫", "gray"],
                      linkedin: ["🔵", "blue"],
                      twitter: ["🐦", "blue"],
                      portfolio: ["🌐", "green"],
                    };
                    const [icon, color] = map[platform] || ["🔗", "blue"];
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center px-4 py-3 bg-${color}-50 text-${color}-800 text-xs font-medium rounded-lg border border-${color}-200`}
                      >
                        <span className="mb-2 text-2xl">{icon}</span>
                        <span className="text-center">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

          <section className="rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
              Quick actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/blog", label: "Latest articles" },
                { href: "/portfolio", label: "Portfolio" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <p className="px-2 text-xs text-stone-400">
            Signed in as{" "}
            <span className="font-mono text-stone-500">
              {pick(displayUser, "Email", "email")}
            </span>
            . Your session is stored locally in your browser.{" "}
            <button
              onClick={handleLogout}
              className="font-semibold text-rose-500 underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </p>
        </>
      )}
    </main>
  );
}
