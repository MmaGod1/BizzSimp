import type {
  ItemComparison,
  SalesAnalysisSuccess,
} from "@/lib/analyzeSales";

export type SalesCopy = {
  headline: string;
  selling: string[];
  slowing: string[];
  suggestion: string;
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function money(value: number): string {
  return naira.format(value);
}

function monthName(label: string): string {
  return label.replace(/\s+\d{4}$/, "");
}

function biggestMover(items: ItemComparison[]): ItemComparison | undefined {
  return [...items].sort(
    (a, b) =>
      Math.abs(b.change) - Math.abs(a.change) ||
      b.latestRevenue - a.latestRevenue ||
      a.item.localeCompare(b.item),
  )[0];
}

export function writeSalesCopy(analysis: SalesAnalysisSuccess): SalesCopy {
  const { previousMonth, latestMonth, revenueChange } = analysis;
  let headline: string;

  if (previousMonth.revenue === 0) {
    headline = `You earned ${money(latestMonth.revenue)} in ${latestMonth.label}. ${previousMonth.label} had no sales to compare with, so there's no percentage change to show.`;
  } else if (
    Math.abs(revenueChange) <= previousMonth.revenue * 0.1
  ) {
    headline = `Sales were steady at ${money(latestMonth.revenue)} in ${latestMonth.label}.`;
  } else if (revenueChange > 0) {
    const percentage = Math.round(analysis.percentageChange ?? 0);
    const leadingIncrease = [...analysis.itemComparisons]
      .filter((item) => item.change > 0)
      .sort((a, b) => b.change - a.change || a.item.localeCompare(b.item))[0];
    const itemAttribution =
      leadingIncrease && leadingIncrease.change >= revenueChange / 3
        ? `, with ${leadingIncrease.item} making the biggest difference`
        : "";
    headline = `Sales rose ${percentage}% to ${money(latestMonth.revenue)} in ${latestMonth.label}${itemAttribution}.`;
  } else if (revenueChange < 0) {
    headline = `Sales fell ${money(Math.abs(revenueChange))} to ${money(latestMonth.revenue)} in ${latestMonth.label}.`;
  } else {
    headline = `Sales stayed steady at ${money(latestMonth.revenue)} in ${latestMonth.label}.`;
  }

  const selling =
    analysis.topItems.length > 0
      ? analysis.topItems.map(
          (item) =>
            `${item.item}: ${money(item.latestRevenue)} from ${item.latestUnits} ${item.latestUnits === 1 ? "unit" : "units"}.`,
        )
      : ["No items brought in sales in the latest month."];
  const slowing =
    previousMonth.revenue === 0
      ? [`There is nothing to compare against because ${previousMonth.label} had no sales.`]
      : analysis.slowingItems.length > 0
        ? analysis.slowingItems.map((item) => {
            const latestResult =
              item.latestUnits === 0
                ? `no sales in ${monthName(latestMonth.label)}`
                : `${money(item.latestRevenue)} in ${monthName(latestMonth.label)}`;
            return `${item.item}: ${money(item.previousRevenue)} in ${monthName(previousMonth.label)}, ${latestResult}.`;
          })
        : [
            "No items had a revenue drop greater than 10% of their previous month's revenue.",
          ];

  let suggestion: string;
  if (previousMonth.revenue === 0) {
    const topSeller = analysis.topItems[0];
    suggestion = topSeller
      ? `Consider featuring ${topSeller.item}, your top seller at ${money(topSeller.latestRevenue)} for ${topSeller.latestUnits} ${topSeller.latestUnits === 1 ? "unit" : "units"}.`
      : "Keep tracking sales to see which items become your top sellers.";
  } else {
    const mover = biggestMover(analysis.itemComparisons);
    if (!mover || Math.abs(mover.change) <= previousMonth.revenue * 0.1) {
      const topSeller = analysis.topItems[0];
      suggestion = topSeller
        ? `Sales look steady. Keep featuring ${topSeller.item}, the latest month's top seller at ${money(topSeller.latestRevenue)}.`
        : "Sales look steady. Keep highlighting the items your customers like.";
    } else if (mover.change > 0) {
      suggestion = `Consider featuring ${mover.item} more: its revenue rose from ${money(mover.previousRevenue)} to ${money(mover.latestRevenue)}.`;
    } else {
      suggestion = `Look into ${mover.item}: its revenue fell from ${money(mover.previousRevenue)} to ${money(mover.latestRevenue)}. A discount or a fresh photo may help.`;
    }
  }

  return { headline, selling, slowing, suggestion };
}
