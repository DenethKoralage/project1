"use client";

import { useState } from "react";
import { expenseCategories } from "./expenseCategories";
import { postWithAuth } from "@/lib/authApi";

const emptyExpenseForm = {
  Amount: "",
  Category: "Housing & Utilities",
  ExpenseDate: new Date().toISOString().slice(0, 10),
  Description: "",
};

export function AddExpenseForm({ token, onExpenseAdded }) {
  const [form, setForm] = useState(emptyExpenseForm);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Number(form.Amount) <= 0) {
      setStatus({ type: "error", message: "Enter an amount greater than zero." });
      return;
    }

    if (!form.Category) {
      setStatus({ type: "error", message: "Select a category." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });

      await postWithAuth(
        "/api/expense",
        {
          Amount: Number(form.Amount),
          Category: form.Category,
          ExpenseDate: new Date(form.ExpenseDate).toISOString(),
          Description: form.Description,
        },
        token
      );

      setForm(emptyExpenseForm);
      setStatus({ type: "success", message: "Expense added successfully." });
      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Could not add expense.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
        Add new expense
      </p>

      {status.message ? (
        <p
          className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700">Amount</span>
          <input
            name="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.Amount}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-rose-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Category</span>
          <select
            name="Category"
            value={form.Category}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-rose-500"
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Expense Date</span>
          <input
            name="ExpenseDate"
            type="date"
            value={form.ExpenseDate}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-rose-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-stone-700">Description</span>
          <textarea
            name="Description"
            value={form.Description}
            onChange={handleChange}
            maxLength={512}
            rows={3}
            className="mt-1 w-full rounded-md border border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-rose-500"
          />
        </label>

        <button
          type="submit"
          disabled={isSaving || !token}
          className="w-full rounded-md bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Adding..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
}