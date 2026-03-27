import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioBySlug, portfolioStrategies } from "@/lib/portfolio";

export function generateStaticParams() {
  return portfolioStrategies.map((portfolio) => ({
    category: portfolio.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const portfolio = getPortfolioBySlug(category);

  if (!portfolio) {
    return {
      title: "Portfolio Not Found",
    };
  }

  return {
    title: portfolio.name,
    description: portfolio.summary,
  };
}

export default async function PortfolioCategoryPage({ params }) {
  const { category } = await params;
  const portfolio = getPortfolioBySlug(category);

  if (!portfolio) {
    notFound();
  }

  return (
    <main className="relative w-full space-y-10 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -left-12 top-10 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-56 w-56 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            {portfolio.risk}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            {portfolio.name}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
            {portfolio.description}
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Strategy Overview
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Best For</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {portfolio.audience}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Objective</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {portfolio.objective}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">
                Time Horizon
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {portfolio.timeHorizon}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-500">Risk Level</p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {portfolio.risk}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Suggested Allocation
            </h2>
            <div className="mt-5 space-y-3">
              {portfolio.allocations.map((allocation) => (
                <div
                  key={allocation.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
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
          </div>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
            Key Principles
          </p>
          <div className="mt-5 space-y-3">
            {portfolio.principles.map((principle) => (
              <div
                key={principle}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {principle}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/portfolio"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Back to Portfolio
            </Link>
            <Link
              href="/contacts"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white"
            >
              Send Feedback
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
