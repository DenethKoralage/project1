/**
 * CtaSection — the dark slate call-to-action card that appears at the bottom
 * of the home page and about page.
 *
 * @param {{
 *   heading: string,
 *   subtext?: string,
 *   children: React.ReactNode,   ← action buttons (Link / Button atoms)
 *   className?: string,
 * }} props
 */
export function CtaSection({ heading, subtext, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-7 text-white md:p-10 ${className}`}
    >
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{heading}</h2>
          {subtext && (
            <p className="mt-2 text-sm text-slate-200 md:text-base">{subtext}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
