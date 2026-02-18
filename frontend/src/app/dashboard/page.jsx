"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RollingNumber from "@/components/RollingNumber";
import { apiRequest } from "@/lib/api";
import { clearAuth, getToken, getUser, updateStoredUser } from "@/lib/auth";

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

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

  const [expenseForm, setExpenseForm] = useState({
    month: getCurrentMonth(),
    category: "",
    description: "",
    amount: "",
  });
  const [expenses, setExpenses] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [remainingBudget, setRemainingBudget] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(false);

  const loadFinanceData = useCallback(async (authToken, monthValue) => {
    setFinanceLoading(true);
    try {
      const [expenseResult, predictionResult, remainingBudgetResult] = await Promise.all([
        apiRequest(`/api/finance/monthly-usual-expenses?month=${monthValue}`, { token: authToken }),
        apiRequest("/api/finance/prediction/next-month", { token: authToken }),
        apiRequest("/api/finance/get-remaining-budget", { token: authToken }),
      ]);

      setExpenses(expenseResult || []);
      setPrediction(predictionResult);
      setRemainingBudget(Number(remainingBudgetResult?.remainingBudget ?? 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setFinanceLoading(false);
    }
  }, []);

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
    loadFinanceData(storedToken, expenseForm.month);
  }, [expenseForm.month, loadFinanceData, loadProfile, router]);

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

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!token) return;

    setError("");
    setMessage("");

    try {
      await apiRequest("/api/finance/monthly-usual-expenses", {
        method: "POST",
        token,
        body: {
          month: `${expenseForm.month}-01T00:00:00Z`,
          category: expenseForm.category,
          description: expenseForm.description,
          amount: Number(expenseForm.amount),
        },
      });

      setExpenseForm((prev) => ({ ...prev, category: "", description: "", amount: "" }));
      await loadFinanceData(token, expenseForm.month);
      setMessage("Monthly expense added.");
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
        <p className="text-slate-500 mt-2">Manage your account, expenses, and predictions.</p>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      {message && <p className="text-sm text-emerald-700 text-center">{message}</p>}

      <div className="rounded-xl border bg-transparent p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Dashboard Menu</h2>
        <div className="flex flex-wrap gap-2">
          <a href="#add-expense" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Add Expense
          </a>
          <a href="#expense-sheet" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Monthly Expense Sheet
          </a>
          <a href="#prediction-sheet" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Predicted Expenses
          </a>
          <a href="#edit-profile" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Edit Profile
          </a>
          <a href="#delete-account" className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800">
            Delete Account
          </a>
        </div>
      </div>

      <div className="rounded-xl bg-transparent p-6 shadow-sm text-center">
        <h2 className="text-xl font-semibold">Current Monthly Income</h2>
        <p className="text-9xl font-bold mt-4">
          <RollingNumber target={balance} duration={1200} />
        </p>
      </div>

      <form id="add-expense" onSubmit={handleAddExpense} className="rounded-xl border bg-transparent p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add Monthly Usual Expense</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="expenseMonth">Month</label>
            <input id="expenseMonth" type="month" value={expenseForm.month} onChange={(e) => setExpenseForm((prev) => ({ ...prev, month: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="expenseCategory">Category</label>
            <input id="expenseCategory" value={expenseForm.category} onChange={(e) => setExpenseForm((prev) => ({ ...prev, category: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Rent, Food, Utilities" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="expenseDescription">Description</label>
            <input id="expenseDescription" value={expenseForm.description} onChange={(e) => setExpenseForm((prev) => ({ ...prev, description: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="expenseAmount">Amount</label>
            <input id="expenseAmount" type="number" min="0.01" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" required />
          </div>
        </div>
        <button type="submit" className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">Save Expense</button>
      </form>

      <div id="expense-sheet" className="rounded-xl border bg-transparent p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Monthly Expense Sheet ({expenseForm.month})</h2>
        {financeLoading ? (
          <p className="text-sm text-slate-500">Loading expense data...</p>
        ) : expenses.length === 0 ? (
          <p className="text-sm text-slate-500">No expenses for this month yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2">Category</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-2">{item.category}</td>
                    <td className="py-2">{item.description || "-"}</td>
                    <td className="py-2">${Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 border-t border-slate-200 pt-3 text-right text-sm font-semibold">
          Current Balance: ${Number(remainingBudget ?? 0).toFixed(2)}
        </div>
      </div>

      <div id="prediction-sheet" className="rounded-xl border border-slate-200 bg-transparent p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Predicted Next Month Expense Sheet</h2>
        {prediction && (
          <p className="text-sm text-slate-500 mb-3">
            Month: {new Date(prediction.predictedMonth).toLocaleDateString()} | Total: ${Number(prediction.totalPredicted || 0).toFixed(2)}
          </p>
        )}
        {!prediction || prediction.items.length === 0 ? (
          <p className="text-sm text-slate-500">Not enough data yet. Add monthly expenses to generate predictions.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2">Category</th>
                  <th className="py-2">Predicted Amount</th>
                  <th className="py-2">Recent Average</th>
                  <th className="py-2">Source Months</th>
                </tr>
              </thead>
              <tbody>
                {prediction.items.map((item) => (
                  <tr key={item.category} className="border-b border-slate-100">
                    <td className="py-2">{item.category}</td>
                    <td className="py-2">${Number(item.predictedAmount).toFixed(2)}</td>
                    <td className="py-2">${Number(item.recentAverage).toFixed(2)}</td>
                    <td className="py-2">{item.sourceMonthsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form id="edit-profile" onSubmit={handleProfileUpdate} className="rounded-xl border border-slate-200 bg-transparent p-6 shadow-sm">
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

      <form id="delete-account" onSubmit={handleDeleteAccount} className="rounded-xl border border-red-200 bg-transparent p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Delete Account</h2>
        <p className="text-sm text-red-700 mb-4">This action is permanent.</p>

        <label className="mb-1 block text-sm font-medium" htmlFor="deletePassword">Confirm with password</label>
        <input id="deletePassword" type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="block w-full max-w-sm rounded-md border border-red-300 px-3 py-2 text-sm" required />

        <button type="submit" className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Delete My Account</button>
      </form>
    </div>
  );
}
