"use client";

export function ExpenseLineChart({ data }) {
  const width = 760;
  const height = 260;
  const padding = { top: 34, right: 28, bottom: 46, left: 58 };
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);
  const plotWidth = width - padding.left - padding.right;
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

  return (
    <div className="h-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full min-w-[680px] text-stone-500"
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
                x2={width - padding.right}
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
          x2={width - padding.right}
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
  );
}

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));