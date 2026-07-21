"use client";

import { useRef, useState } from "react";

export function ExpenseLineChart({ data }) {
  const [zoomScale, setZoomScale] = useState(1);
  const containerRef = useRef(null);

  const baseWidth = 760;
  const height = 260;
  const minWidth = Math.max(720, Math.round(720 * zoomScale));

  const padding = { top: 34, right: 28, bottom: 46, left: 58 };
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const plotWidth = baseWidth - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const denominator = Math.max(data.length - 1, 1);

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (index / denominator) * plotWidth;
    const y = padding.top + plotHeight - (item.amount / maxAmount) * plotHeight;
    return { ...item, x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const areaPath = `${linePath} L ${points.at(-1).x} ${padding.top + plotHeight} L ${points[0].x} ${padding.top + plotHeight} Z`;
  const yTicks = [maxAmount, maxAmount / 2, 0];

  const handleZoomIn = () => setZoomScale((prev) => Math.min(3.0, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  const handleResetZoom = () => setZoomScale(1);

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const amount = direction === "left" ? -250 : 250;
      containerRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Zoom & Pan Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <span>🔍</span> Zoom:
          </span>
          <span className="font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded min-w-[50px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Scroll Action Buttons */}
          <div className="flex items-center gap-1 mr-1">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 active:scale-95 transition shadow-sm"
              title="Pan Left"
            >
              ◀ Left
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 hover:bg-stone-100 active:scale-95 transition shadow-sm"
              title="Pan Right"
            >
              Right ▶
            </button>
          </div>

          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 0.75}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-white border border-stone-300 font-bold text-stone-700 hover:bg-stone-100 active:scale-95 disabled:opacity-40 transition shadow-sm"
            title="Zoom Out"
          >
            - Zoom Out
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 3.0}
            className="flex items-center justify-center h-8 px-3 rounded-lg bg-rose-600 font-bold text-white hover:bg-rose-700 active:scale-95 disabled:opacity-40 transition shadow-sm"
            title="Zoom In"
          >
            + Zoom In
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            disabled={zoomScale === 1}
            className="flex items-center justify-center h-8 px-2.5 rounded-lg bg-stone-200 font-semibold text-stone-700 hover:bg-stone-300 active:scale-95 disabled:opacity-40 transition"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Chart Canvas Scroll Container (Uses native overflow-x-auto identical to table below) */}
      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
      >
        <div style={{ width: `${minWidth}px`, minWidth: `${minWidth}px` }}>
          <svg
            viewBox={`0 0 ${baseWidth} ${height}`}
            className="w-full h-auto text-stone-500 block"
            role="img"
            aria-label="Expense progress line chart"
          >
            <defs>
              <linearGradient id="expenseLineFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => {
              const y = padding.top + plotHeight - (tick / maxAmount) * plotHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    x2={baseWidth - padding.right}
                    y1={y}
                    y2={y}
                    stroke="#e7e5e4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-stone-400 text-[11px]"
                  >
                    {formatMoney(tick)}
                  </text>
                </g>
              );
            })}

            <line
              x1={padding.left}
              x2={padding.left}
              y1={padding.top}
              y2={padding.top + plotHeight}
              stroke="#d6d3d1"
            />
            <line
              x1={padding.left}
              x2={baseWidth - padding.right}
              y1={padding.top + plotHeight}
              y2={padding.top + plotHeight}
              stroke="#d6d3d1"
            />

            <path d={areaPath} fill="url(#expenseLineFill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#dc2626"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />

            {points.map((point) => (
              <g key={point.key ?? point.label}>
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={point.y}
                  y2={padding.top + plotHeight}
                  stroke="#d6d3d1"
                  strokeDasharray="4 5"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  className="fill-white stroke-rose-600"
                  strokeWidth="4"
                />
                <text
                  x={point.x}
                  y={point.y - 14}
                  textAnchor="middle"
                  className="fill-stone-800 text-[12px] font-semibold"
                >
                  {formatMoney(point.amount)}
                </text>
                <text
                  x={point.x}
                  y={padding.top + plotHeight + 26}
                  textAnchor="middle"
                  className="fill-stone-500 text-[12px]"
                >
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 px-1 font-medium">
        <span>↔ Swipe or use ◀ ▶ buttons to scroll chart</span>
        <span>Width: {minWidth}px ({Math.round(zoomScale * 100)}%)</span>
      </div>
    </div>
  );
}

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));