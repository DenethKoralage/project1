"use client";

import Link from "next/link";
import { use } from "react";
import { IncomePage } from "./income/IncomePage";
import { BudgetPage } from "./budget/BudgetPage";
import { ExpensesPage } from "./expenses/ExpensesPage";
import { MyBlogsPage } from "./my-blogs/MyBlogsPage";

export default function PortfolioCategoryPage({ params }) {
  const { category } = use(params);

  if (category === "income") return <IncomePage />;
  if (category === "expenses") return <ExpensesPage />;
  if (category === "budget") return <BudgetPage />;
  if (category === "my-blogs") return <MyBlogsPage />;

  return (
    <main className="mx-auto w-full max-w-3xl py-10">
      <Link href="/portfolio" className="text-sm font-semibold text-emerald-700">
        Portfolio
      </Link>
      <h1 className="mt-4 text-3xl font-bold text-stone-950">Category not found</h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        The category &ldquo;{category}&rdquo; does not exist.
      </p>
      <Link
        href="/portfolio"
        className="mt-4 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to portfolio
      </Link>
    </main>
  );
}