/**
 * Badge — versatile pill/chip component used for category labels, status
 * indicators, page-top branding labels, and "My Post" overlays.
 *
 * @param {{
 *   children: React.ReactNode,
 *   variant?: 'hero-back'|'page-top'|'page-top-alt'|'status-active'|'status-spent'|
 *             'blog-category'|'my-post'|'footer-brand'|'composer',
 *   as?: keyof JSX.IntrinsicElements,
 *   className?: string,
 *   [key: string]: any
 * }} props
 *
 * Variant reference (exact classes from codebase):
 *  'hero-back'     – "← Portfolio" pill on dark hero cards
 *  'page-top'      – brand badge on home/about light hero (white/60 bg)
 *  'page-top-alt'  – secondary badge on home/about (slate/10 bg)
 *  'status-active' – green "Active" pill in Budget table
 *  'status-spent'  – grey "Spent" pill in Budget table
 *  'blog-category' – semi-transparent blog card image overlay category badge
 *  'my-post'       – dark overlay "My Post" badge on blog cards
 *  'footer-brand'  – emerald pill in Footer brand section
 *  'composer'      – small label inside MyBlogs composer
 */
export function Badge({
  children,
  variant = "page-top",
  as: Tag = "p",
  className = "",
  ...props
}) {
  const variants = {
    "hero-back":
      "inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-500/30",
    "page-top":
      "inline-flex rounded-full border border-emerald-900/10 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700",
    "page-top-alt":
      "inline-flex rounded-full bg-slate-900/10 px-3 py-1 text-xs font-semibold text-slate-800",
    "status-active":
      "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700",
    "status-spent":
      "rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600",
    "blog-category":
      "rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm",
    "my-post":
      "rounded-full bg-emerald-900/80 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-sm",
    "footer-brand":
      "inline-flex rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200",
    composer:
      "rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700",
  };

  return (
    <Tag className={`${variants[variant] ?? variants["page-top"]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
