/**
 * AuthFormTemplate — layout skeleton for authentication pages (login / signup).
 *
 * @param {{
 *   kicker?: string,
 *   title: string,
 *   subtitle?: string,
 *   children: React.ReactNode,
 *   maxWidth?: string,
 *   className?: string,
 * }} props
 */
export function AuthFormTemplate({
  kicker = "Welcome Back",
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
  className = "",
}) {
  return (
    <main className={`mx-auto w-full ${maxWidth} py-10 ${className}`}>
      <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-cyan-50 p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
        <div className="space-y-3">
          {kicker && (
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
              {kicker}
            </p>
          )}
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
          {subtitle && (
            <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </section>
    </main>
  );
}
