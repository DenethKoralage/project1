/**
 * PortfolioSubpageTemplate — layout skeleton for portfolio category pages.
 * Slot-based: accepts heroSlot, statusSlot, and children (content).
 *
 * @param {{
 *   heroSlot: React.ReactNode,
 *   statusSlot?: React.ReactNode,
 *   children: React.ReactNode,
 *   className?: string,
 * }} props
 */
export function PortfolioSubpageTemplate({
  heroSlot,
  statusSlot,
  children,
  className = "",
}) {
  return (
    <main className={`mx-auto w-full max-w-6xl min-w-0 space-y-6 py-8 ${className}`}>
      {heroSlot}
      {statusSlot}
      {children}
    </main>
  );
}
