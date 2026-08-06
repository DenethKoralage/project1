/**
 * Button — general-purpose button atom.
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'primary'|'emerald'|'hero'|'danger'|'ghost-danger'|'ghost-emerald'|'outline'|'outline-dark',
 *   fullWidth?: boolean,
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variant reference (maps to exact Tailwind classes from the codebase):
 *
 *  'primary'       – dark slate, md radius     (login submit, MyBlogs publish, export)
 *  'emerald'       – emerald-600, md radius     (income/budget form submit)
 *  'hero'          – emerald-400, 2xl radius    (portfolio hero action buttons)
 *  'danger'        – rose-600, md radius        (expense form submit, delete confirm)
 *  'ghost-danger'  – rose text + border         (income table delete, budget remove)
 *  'ghost-emerald' – emerald text + border      (mark-as-spent budget action)
 *  'outline'       – slate border, xl radius    (modal cancel, secondary actions)
 *  'outline-dark'  – slate border on dark bg    (home/about secondary CTA)
 */
export function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60";

  const variants = {
    primary:
      "rounded-md bg-slate-900 px-4 py-2.5 text-sm text-white hover:bg-slate-800",
    emerald:
      "rounded-md bg-emerald-600 px-4 py-2.5 text-sm text-white hover:bg-emerald-700",
    hero:
      "rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg hover:bg-emerald-300 hover:scale-[1.02]",
    danger:
      "rounded-md bg-rose-600 px-4 py-2.5 text-sm text-white hover:bg-rose-700",
    "ghost-danger":
      "rounded-md border border-rose-200 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50",
    "ghost-emerald":
      "rounded-md border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50",
    outline:
      "rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50",
    "outline-dark":
      "rounded-xl border border-white/40 px-5 py-3 text-sm text-white hover:bg-white/10",
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
