"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RollingNumber from "@/components/RollingNumber";
import { apiRequest } from "@/lib/api";
import { clearAuth, getToken, getUser, updateStoredUser } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    designation: "",
    avgIncome: "",
    newPassword: "",
  });

  const [deletePassword, setDeletePassword] = useState("");

  const loadProfile = useCallback(async (authToken) => {
    try {
      const profile = await apiRequest("/api/auth/profile", { token: authToken });
      setUser(profile);
      updateStoredUser(profile);
      setForm((prev) => ({
        ...prev,
        fullName: profile.fullName || "",
        designation: profile.designation || "",
        avgIncome: String(profile.avgIncome ?? ""),
      }));
      setError("");
    } catch (err) {
      setError(err.message);
      if (err.message.toLowerCase().includes("unauthorized") || err.message.toLowerCase().includes("invalid token")) {
        clearAuth();
        router.push("/dashboard/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();

    if (!storedToken) {
      router.push("/dashboard/login");
      return;
    }

    setToken(storedToken);

    if (storedUser) {
      setUser(storedUser);
      setForm({
        fullName: storedUser.fullName || "",
        designation: storedUser.designation || "",
        avgIncome: String(storedUser.avgIncome ?? ""),
        newPassword: "",
      });
    }

    loadProfile(storedToken);
  }, [loadProfile, router]);

  const balance = useMemo(() => Number(user?.avgIncome || 0), [user]);

  async function handleProfileUpdate(e) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setMessage("");

    try {
      const updated = await apiRequest("/api/auth/profile", {
        method: "PUT",
        token,
        body: {
          fullName: form.fullName,
          designation: form.designation,
          avgIncome: Number(form.avgIncome || 0),
          newPassword: form.newPassword || null,
        },
      });

      setUser(updated);
      updateStoredUser(updated);
      setForm((prev) => ({ ...prev, newPassword: "" }));
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    if (!token) return;

    try {
      await apiRequest("/api/auth/logout", { method: "POST", token });
    } catch {
    } finally {
      clearAuth();
      router.push("/dashboard/login");
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setMessage("");

    try {
      await apiRequest("/api/auth/account", {
        method: "DELETE",
        token,
        body: { password: deletePassword },
      });

      clearAuth();
      router.push("/dashboard/register");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="py-10 text-center">Loading account...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500 mt-2">Manage your account and profile information.</p>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      {message && <p className="text-sm text-emerald-700 text-center">{message}</p>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <h2 className="text-xl font-semibold">Current Monthly Income</h2>
        <p className="text-7xl font-bold mt-4">
          <RollingNumber target={balance} duration={1200} />
        </p>
      </div>

      <form onSubmit={handleProfileUpdate} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="fullName">Full name</label>
            <input id="fullName" value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="designation">Designation</label>
            <input id="designation" value={form.designation} onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="avgIncome">Average Monthly Income</label>
            <input id="avgIncome" type="number" min="0" value={form.avgIncome} onChange={(e) => setForm((prev) => ({ ...prev, avgIncome: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="newPassword">New Password (optional)</label>
            <input id="newPassword" type="password" value={form.newPassword} onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Save Changes</button>
          <button type="button" onClick={handleLogout} className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Logout</button>
        </div>
      </form>

      <form onSubmit={handleDeleteAccount} className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Delete Account</h2>
        <p className="text-sm text-red-700 mb-4">This action is permanent.</p>

        <label className="mb-1 block text-sm font-medium" htmlFor="deletePassword">Confirm with password</label>
        <input id="deletePassword" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="block w-full max-w-sm rounded-md border border-red-300 px-3 py-2 text-sm" required />

        <button type="submit" className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Delete My Account</button>
      </form>
    </div>
  );
}
