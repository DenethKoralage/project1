/**
 * IconButton — a small button that wraps an SVG icon.
 * Used for hamburger toggle, modal close (×), etc.
 *
 * @param {{
 *   onClick: () => void,
 *   'aria-label': string,
 *   children: React.ReactNode,
 *   variant?: 'glass'|'border'|'ghost',
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variants:
 *  'glass'  – frosted glass for Navbar hamburger
 *  'border' – bordered for drawer close button
 *  'ghost'  – plain for form/modal close (×) buttons
 */
export function IconButton({
  onClick,
  "aria-label": ariaLabel,
  children,
  variant = "border",
  className = "",
  ...rest
}) {
  const variants = {
    glass:  "flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/20 text-slate-800 transition hover:bg-white/40 active:scale-95",
    border: "flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50",
    ghost:  "flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-stone-500 transition hover:bg-stone-100 hover:text-stone-950",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${variants[variant] ?? variants.border} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
