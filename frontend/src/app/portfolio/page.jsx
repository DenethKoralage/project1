import Link from "next/link";

const categories = [
  {
    href: "/portfolio/income",
    name: "Income",
    kicker: "Track receiving progress",
    description:
      "Record salary, freelancing, dividends, interest, and other income while watching progress by date and amount.",
    metric: "Monthly / Annual",
  },
  {
    href: "/portfolio/expenses",
    name: "Expenses",
    kicker: "Control spending",
    description:
      "Review outgoing money by category, date, and amount so spending patterns stay visible.",
    metric: "Coming next",
  },
  {
    href: "/portfolio/budget",
    name: "Budget",
    kicker: "Plan allocations",
    description:
      "Set budget targets, compare usage, and keep remaining balances easy to scan.",
    metric: "Coming next",
  },
  {
    href: "/blog",
    name: "My Blogs",
    kicker: "Write and review",
    description:
      "Keep personal finance notes, lessons, and ideas connected to your money habits.",
    metric: "Open blog",
  },
];

export const metadata = {
  title: "Portfolio Dashboard",
  description: "Manage income, expenses, budgets, and personal finance blogs.",
};

export default function PortfolioPage() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 py-10">
      <section className="border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
          Portfolio
        </p>
        <h1 className="mt-3 text-3xl font-bold text-stone-950 md:text-4xl">
          Financial workspace
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
          Move between the four main areas of your money system: income,
          expenses, budget, and your finance writing.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {categories.map((category) => (
          <article
            key={category.name}
            className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              {category.kicker}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-stone-950">
              {category.name}
            </h2>
            <p className="mt-3 min-h-24 text-sm leading-6 text-stone-600">
              {category.description}
            </p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-emerald-700">
                {category.metric}
              </p>
              <Link
                href={category.href}
                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                Open
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
