import Link from "next/link";
import { portfolioStrategies } from "@/lib/portfolio";

const checklist = [
  "Build your emergency fund before increasing portfolio risk.",
  "Choose one allocation you can stick with through market swings.",
  "Invest on a schedule instead of waiting for the perfect moment.",
  "Review and rebalance periodically, not emotionally.",
];

export const metadata = {
  title: "Portfolio",
  description: "Explore simple model portfolio ideas for different risk levels.",
};

export default function PortfolioPage() {
  return (
    <main className="relative w-full space-y-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -right-16 -top-12 h-52 w-52 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Portfolio Ideas
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Simple portfolio approaches for different risk levels.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
            These model portfolios are designed to help readers think clearly
            about diversification, time horizon, and risk. They are educational
            starting points, not one-size-fits-all investment advice.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {portfolioStrategies.map((portfolio) => (
          <article
            key={portfolio.slug}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                  {portfolio.risk}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {portfolio.name}
                </h2>
              </div>
              <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {portfolio.timeHorizon}
              </p>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
              {portfolio.summary}
            </p>

            <div className="mt-5 space-y-3">
              {portfolio.allocations.map((allocation) => (
                <div
                  key={allocation.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600">
                      {allocation.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {allocation.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/portfolio/${portfolio.slug}`}
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                View Strategy
              </Link>
              <Link
                href="/contacts"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Ask a Question
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Before You Invest
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
            A good portfolio works best when the basics are already in place.
          </h2>
          <div className="mt-6 space-y-3">
            {checklist.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Practical Note
          </p>
          <h2 className="mt-3 text-2xl font-bold md:text-3xl">
            The right portfolio is the one you can keep following.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
            Most investment mistakes do not come from choosing a terrible asset
            mix. They come from panic, inconsistency, or chasing trends. Start
            with a structure that matches your goals and behavior, then let time
            and consistency do the heavy lifting.
          </p>
          <Link
            href="/blog"
            className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
          >
            Read Investing Guides
          </Link>
        </aside>
      </section>
    </main>
  );
}
