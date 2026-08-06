"use client";

/**
 * ChartZoomControls — pan and zoom buttons used by the income/expense line charts.
 *
 * @param {{
 *   onZoomIn: () => void,
 *   onZoomOut: () => void,
 *   onReset: () => void,
 *   onPanLeft: () => void,
 *   onPanRight: () => void,
 *   className?: string,
 * }} props
 */
export function ChartZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onPanLeft,
  onPanRight,
  className = "",
}) {
  const btn =
    "rounded-md border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 active:scale-95";

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      <button type="button" onClick={onPanLeft}  className={btn}>◀</button>
      <button type="button" onClick={onZoomIn}   className={btn}>+</button>
      <button type="button" onClick={onReset}    className={btn}>Reset</button>
      <button type="button" onClick={onZoomOut}  className={btn}>−</button>
      <button type="button" onClick={onPanRight} className={btn}>▶</button>
    </div>
  );
}
