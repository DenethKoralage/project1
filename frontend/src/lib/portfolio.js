export const portfolioStrategies = [
  {
    slug: "starter",
    name: "Starter Portfolio",
    audience: "For first-time investors who want a simple base.",
    objective: "Build confidence with a diversified long-term structure.",
    risk: "Low to Moderate",
    timeHorizon: "3+ years",
    summary:
      "A steady allocation designed for beginners who want broad exposure without making the portfolio feel complicated.",
    description:
      "The starter portfolio focuses on diversification, habit building, and consistency. It is useful for someone who is beginning their investing journey and wants a structure that is easy to understand and maintain.",
    allocations: [
      { label: "Global Equity Funds", value: "50%" },
      { label: "Bond Funds", value: "30%" },
      { label: "Cash Reserve", value: "20%" },
    ],
    principles: [
      "Keep costs low and contributions automatic.",
      "Avoid frequent changes based on short-term market noise.",
      "Review the allocation every six to twelve months.",
    ],
  },
  {
    slug: "balanced",
    name: "Balanced Portfolio",
    audience: "For investors who want growth with manageable volatility.",
    objective: "Combine long-term growth with meaningful downside protection.",
    risk: "Moderate",
    timeHorizon: "5+ years",
    summary:
      "A middle-ground portfolio that blends growth assets with stabilizers for a calmer investing experience.",
    description:
      "The balanced portfolio is designed for someone who wants stronger long-term returns than a conservative mix, while still keeping a solid defensive layer in place. It works well for investors who value progress and sleep well at night.",
    allocations: [
      { label: "Global Equity Funds", value: "60%" },
      { label: "Bond Funds", value: "25%" },
      { label: "REITs / Income Assets", value: "10%" },
      { label: "Cash Reserve", value: "5%" },
    ],
    principles: [
      "Balance growth with resilience instead of chasing the highest return.",
      "Rebalance when allocations drift meaningfully from the plan.",
      "Keep emergency savings separate from investment money.",
    ],
  },
  {
    slug: "growth",
    name: "Growth Portfolio",
    audience: "For long-term investors comfortable with larger swings.",
    objective: "Maximize long-term compounding through heavier equity exposure.",
    risk: "Moderate to High",
    timeHorizon: "7+ years",
    summary:
      "A growth-oriented allocation for investors with time, discipline, and tolerance for market fluctuations.",
    description:
      "The growth portfolio leans more heavily into equities and accepts higher short-term volatility in exchange for stronger long-term upside. It is best suited to investors with a long horizon and a stable financial foundation.",
    allocations: [
      { label: "Global Equity Funds", value: "75%" },
      { label: "Emerging / Sector Exposure", value: "10%" },
      { label: "Bond Funds", value: "10%" },
      { label: "Cash Reserve", value: "5%" },
    ],
    principles: [
      "Only choose this path if you can stay invested during market dips.",
      "Increase diversification instead of concentrating in a few trendy picks.",
      "Pair the portfolio with a long time horizon and regular investing.",
    ],
  },
];

export function getPortfolioBySlug(slug) {
  return portfolioStrategies.find((portfolio) => portfolio.slug === slug) || null;
}
