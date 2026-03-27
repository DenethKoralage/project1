import Link from "next/link";

const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Contact", href: "/contacts" },
];

const resourceLinks = [
  { label: "Latest Guides", href: "/blog" },
  { label: "Investor Notes", href: "/portfolio" },
  { label: "Member Login", href: "/dashboard/login" },
  { label: "Create Account", href: "/dashboard/register" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-20 w-full overflow-hidden border-t border-emerald-100 bg-slate-950 text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
      <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14">
        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <p className="inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">
              The Financial Freedom
            </p>
            <div className="space-y-3">
              <h2 className="max-w-xl text-3xl font-bold leading-tight text-white md:text-4xl">
                Finish each week knowing exactly where your money is going.
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
                Simple guides, smarter investing habits, and practical systems
                for building a calmer financial life one decision at a time.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Read the Blog
              </Link>
              <Link
                href="/contacts"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Weekly Focus
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <p className="text-sm text-slate-300">This week&apos;s reminder</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Automate one habit that makes saving easier.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-emerald-300/10 p-4">
                  <p className="text-2xl font-bold text-white">12K+</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Readers
                  </p>
                </div>
                <div className="rounded-2xl bg-sky-300/10 p-4">
                  <p className="text-2xl font-bold text-white">180+</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Guides
                  </p>
                </div>
                <div className="rounded-2xl bg-white/8 p-4">
                  <p className="text-2xl font-bold text-white">4.3K</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                    Members
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Explore
            </h3>
            <div className="mt-4 grid gap-3">
              {primaryLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Resources
            </h3>
            <div className="mt-4 grid gap-3">
              {resourceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Connect
            </h3>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>hello@financialfreedom.com</p>
              <p>Colombo, Sri Lanka</p>
              <p>Mon - Fri / 9:00 AM - 5:00 PM</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} The Financial Freedom. All rights reserved.</p>
          <p>Built for readers who want less money stress and more direction.</p>
        </section>
      </div>
    </footer>
  );
}
