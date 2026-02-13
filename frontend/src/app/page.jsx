import Image from "next/image";
import Link from "next/link";
import RollingNumber from "@/components/RollingNumber";

const stats = [
  { label: "Monthly Readers", value: "12K+", realValue: 12028 },
  { label: "Published Articles", value: "180+", realValue: 183 },
  { label: "Avg. Read Time", value: "6 min", realValue: 6.23 },
  { label: "Community Members", value: "4.3K", realValue: 4300 },
];

const featuredPosts = [
  {
    id: "budget-system",
    title: "A Budget System You Will Actually Follow",
    excerpt:
      "Set up a simple 3-account structure to stop overspending without tracking every single dollar.",
    image: "/f1.png",
  },
  {
    id: "investing-checklist",
    title: "Your First Investing Checklist",
    excerpt:
      "Build your first portfolio with practical rules for risk, consistency, and long-term growth.",
    image: "/f2.png",
  },
  {
    id: "income-streams",
    title: "3 Realistic Ways to Build Extra Income",
    excerpt:
      "Actionable ideas to start earning outside your salary without burning out your weekly schedule.",
    image: "/f3.png",
  },
];

const principles = [
  {
    title: "Earn With Intention",
    text: "Design your career and side income around compounding value, not short-term hustle.",
  },
  {
    title: "Spend With Purpose",
    text: "Use money for freedom and leverage. Every expense should support a meaningful outcome.",
  },
  {
    title: "Invest With Patience",
    text: "Focus on repeatable habits and risk control so your portfolio can grow across market cycles.",
  },
];

export default function Home() {
  return (
    <main className="relative w-full space-y-12 pb-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/35 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-emerald-300/35 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {/* TOP BADGES */}
            <div className="flex items-center gap-3">
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                The Financial Freedom
              </p>

              {/* LOGIN — FIXED */}
              <Link
                href="/dashboard/login"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-900/20 hover:scale-105"
              >
                Login
              </Link>

              <Link
                href="/dashboard/register"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-slate-900/20 hover:scale-105"
              >
                Register
              </Link>
            </div>

            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Build a money plan that gives you options, not stress.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-700 md:text-lg">
              Learn practical systems for budgeting, investing, and creating new
              income streams. Each guide is designed to help you make better
              financial decisions with confidence.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Read Latest Articles
              </Link>

              <Link
                href="/portfolio"
                className="rounded-xl border border-slate-900/20 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="justify-self-center">
            <Image
              src="/f4.png"
              alt="Financial planning dashboard"
              width={540}
              height={420}
              className="h-auto w-full max-w-[540px] rounded-2xl border border-white/60 shadow-[0_15px_40px_rgba(15,23,42,0.2)]"
              priority
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-slate-900 md:text-3xl">
              {item.value}
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">
              <RollingNumber target={item.realValue} duration={2000} />
            </p>
          </article>
        ))}
      </section>

      {/* FEATURED */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
            Featured Guides
          </h2>
          <Link href="/blog" className="text-sm font-semibold text-sky-700">
            See all posts
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <Image
                src={post.image}
                alt={post.title}
                width={520}
                height={300}
                className="h-44 w-full object-cover"
              />
              <div className="space-y-3 p-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  {post.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>
                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex text-sm font-semibold text-sky-700"
                >
                  Read more
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Core Principles
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {principles.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-7 text-white md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Start your financial reset today.
            </h2>
            <p className="mt-2 text-sm text-slate-200 md:text-base">
              Pick one strategy, apply it this week, and track your momentum.
              Consistency beats complexity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/about"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Learn Our Mission
            </Link>
            <Link
              href="/contacts"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
