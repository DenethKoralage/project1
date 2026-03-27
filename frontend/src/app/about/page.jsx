import Image from "next/image";
import Link from "next/link";

const principles = [
  {
    title: "Clarity First",
    text: "We break down financial topics into practical steps so readers can act without feeling overwhelmed.",
  },
  {
    title: "Real-Life Systems",
    text: "Our content focuses on budgeting, investing, and income habits that work in everyday life, not just in theory.",
  },
  {
    title: "Steady Progress",
    text: "Small consistent decisions create long-term freedom, so we teach repeatable habits over quick fixes.",
  },
];

const values = [
  "Simple explanations for complex money decisions",
  "Actionable ideas readers can apply this week",
  "Long-term thinking over short-term hype",
  "Confidence built through habits, not guesswork",
];

const steps = [
  {
    number: "01",
    title: "Learn the basics clearly",
    text: "Start with calm, understandable guidance on saving, spending, and building financial awareness.",
  },
  {
    number: "02",
    title: "Build a system that fits your life",
    text: "Create routines around budgeting, investing, and extra income that feel sustainable and realistic.",
  },
  {
    number: "03",
    title: "Grow with consistency",
    text: "Track progress, improve your decisions, and let time do more of the heavy lifting.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative w-full space-y-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-emerald-100 via-cyan-50 to-sky-100 p-8 shadow-[0_20px_70px_rgba(13,38,76,0.12)] md:p-12">
        <div className="absolute -left-12 top-10 h-52 w-52 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-60 w-60 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                About Us
              </p>
              <p className="inline-flex rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-800">
                The Financial Freedom
              </p>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                We help people build a calmer, smarter relationship with money.
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
                The Financial Freedom is built for readers who want practical
                guidance they can actually use. We share simple systems for
                budgeting, investing, and creating extra income so financial
                progress feels possible, not intimidating.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Explore Articles
              </Link>
              <Link
                href="/contacts"
                className="rounded-xl border border-slate-900/20 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-white"
              >
                Contact Our Team
              </Link>
            </div>
          </div>

          <div className="relative justify-self-center">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/25 blur-2xl" />
            <Image
              src="/f5.png"
              alt="About The Financial Freedom"
              width={760}
              height={620}
              className="relative h-auto w-full max-w-[540px] rounded-[2rem] border border-white/60 object-cover shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
              priority
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {principles.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
              {item.text}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
            Our Story
          </p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
            Money advice should feel empowering, not exhausting.
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
            Too much financial content is either overly technical or built
            around unrealistic promises. We created The Financial Freedom to
            offer something better: honest, useful guidance that respects where
            people are starting from.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
            Whether someone is fixing their budget, learning how to invest for
            the first time, or exploring new income opportunities, our goal is
            to make progress feel clear and achievable.
          </p>
        </article>

        <aside className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
            What We Believe
          </p>
          <div className="mt-5 space-y-3">
            {values.map((value) => (
              <div
                key={value}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              >
                {value}
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
              How We Help
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              A practical path toward financial confidence
            </h2>
          </div>
          <Link href="/portfolio" className="text-sm font-semibold text-sky-700">
            View our portfolio ideas
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm font-semibold tracking-[0.24em] text-emerald-700">
                {step.number}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {step.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-7 text-white md:p-10">
        <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              Start building your financial freedom with a clear next step.
            </h2>
            <p className="mt-2 text-sm text-slate-200 md:text-base">
              Read one guide, apply one idea this week, and build momentum that
              lasts.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/blog"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Read Articles
            </Link>
            <Link
              href="/dashboard/register"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              Join the Community
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
