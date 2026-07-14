"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * Tolerant field reader: the backend UserDto uses PascalCase
 * (Name, Email, AVGIncome, ...). We also fall back to the
 * camelCase keys so the UI keeps working if the source differs.
 */
const pick = (u, pascal, camel) =>
  u?.[pascal] ?? u?.[camel] ?? "";

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
  const { user: authUser, logout, loading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
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
    AVGIncome: "",
    bio: "",
    socialLinks: { github: "", linkedin: "", twitter: "", portfolio: "" },
  });
  const [updateStatus, setUpdateStatus] = useState({ type: "", message: "" });

  // Redirect to login if not authenticated after rehydration.
  useEffect(() => {
    if (!loading && !authUser) {
      router.replace("/login");
    }
  }, [loading, authUser, router]);

  // Fetch the latest profile from the API (/api/user mock in dev).
  useEffect(() => {
    if (!loading && authUser) {
      fetchProfile();
    }
  }, [loading, authUser]);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch("/api/user", { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch profile");
      const data = await response.json();
      const u = data?.user ?? authUser;
      setProfile(u);
      setEditForm({
        Name: pick(u, "Name", "name"),
        Email: pick(u, "Email", "email"),
        Designation: pick(u, "Designation", "designation"),
        Workplace: pick(u, "Workplace", "workplace"),
        HomeAddress: pick(u, "HomeAddress", "homeAddress"),
        HomeCity: pick(u, "HomeCity", "homeCity"),
        Country: pick(u, "Country", "country"),
        Currency: u?.Currency ?? u?.currency ?? "",
        AVGIncome: pick(u, "AVGIncome", "avgIncome"),
        bio: u?.bio ?? "",
        socialLinks: {
          github: u?.socialLinks?.github ?? "",
          linkedin: u?.socialLinks?.linkedin ?? "",
          twitter: u?.socialLinks?.twitter ?? "",
          portfolio: u?.socialLinks?.portfolio ?? "",
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      const u = authUser;
      setProfile(u);
      setEditForm({
        Name: pick(u, "Name", "name"),
        Email: pick(u, "Email", "email"),
        Designation: pick(u, "Designation", "designation"),
        Workplace: pick(u, "Workplace", "workplace"),
        HomeAddress: pick(u, "HomeAddress", "homeAddress"),
        HomeCity: pick(u, "HomeCity", "homeCity"),
        Country: pick(u, "Country", "country"),
        Currency: u?.Currency ?? u?.currency ?? "",
        AVGIncome: pick(u, "AVGIncome", "avgIncome"),
        bio: u?.bio ?? "",
        socialLinks: {
          github: u?.socialLinks?.github ?? "",
          linkedin: u?.socialLinks?.linkedin ?? "",
          twitter: u?.socialLinks?.twitter ?? "",
          portfolio: u?.socialLinks?.portfolio ?? "",
        },
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socialLinks.")) {
      const [, key] = name.split(".");
      setEditForm((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value },
      }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateStatus({ type: "pending", message: "Updating profile..." });
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: editForm.Name,
          Email: editForm.Email,
          Designation: editForm.Designation,
          Workplace: editForm.Workplace,
          HomeAddress: editForm.HomeAddress,
          HomeCity: editForm.HomeCity,
          Country: editForm.Country,
          Currency: editForm.Currency,
          AVGIncome: Number(editForm.AVGIncome),
          bio: editForm.bio,
          socialLinks: editForm.socialLinks,
        }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setEditMode(false);
        setUpdateStatus({ type: "success", message: "Profile updated successfully!" });
        setTimeout(() => setUpdateStatus({ type: "", message: "" }), 3000);
      } else {
        throw new Error(data.message || "Failed to update profile");
      }
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

  const displayUser = profile || authUser;
  if (!displayUser) return <div>Loading...</div>;

  const name = pick(displayUser, "Name", "name") || "User";
  const designation = pick(displayUser, "Designation", "designation");
  const currency = displayUser?.Currency || displayUser?.currency || "USD";
  const avgIncome =
    pick(displayUser, "AVGIncome", "avgIncome") ||
    pick(displayUser, "avgIncome", "avgIncome") ||
    0;

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
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Designation</label>
                <input
                  type="text"
                  name="Designation"
                  value={editForm.Designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Workplace</label>
                <input
                  type="text"
                  name="Workplace"
                  value={editForm.Workplace}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Home Address</label>
                <input
                  type="text"
                  name="HomeAddress"
                  value={editForm.HomeAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Home City</label>
                <input
                  type="text"
                  name="HomeCity"
                  value={editForm.HomeCity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Country</label>
                <select
                  name="Country"
                  value={editForm.Country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="" disabled>Select your country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Currency</label>
                <select
                  name="Currency"
                  value={editForm.Currency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="" disabled>Select your currency</option>
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Average Monthly Income</label>
                <input
                  type="number"
                  name="AVGIncome"
                  value={editForm.AVGIncome}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">Bio</label>
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
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
              <LedgerRow label="Country" value={pick(displayUser, "Country", "country")} />
              <LedgerRow label="Currency" value={currency} />
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
