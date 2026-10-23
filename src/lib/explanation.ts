import type { SalesAnalysisSuccess } from "@/lib/analyzeSales";

export const MAX_EXPLANATION_ITEMS = 12;

export type ExplanationRequest = {
  previousMonth: { label: string; revenue: number };
  latestMonth: { label: string; revenue: number };
  items: {
    name: string;
    previousRevenue: number;
    latestRevenue: number;
  }[];
  omittedItemCount: number;
};

export function createExplanationRequest(
  analysis: SalesAnalysisSuccess,
): ExplanationRequest {
  const selectedItems = new Map<
    string,
    ExplanationRequest["items"][number]
  >();

  for (const item of analysis.topItems) {
    selectedItems.set(item.item, {
      name: item.item.replace(/\s+/g, " ").trim().slice(0, 80),
      previousRevenue: item.previousRevenue,
      latestRevenue: item.latestRevenue,
    });
  }

  const largestChanges = [...analysis.itemComparisons].sort(
    (a, b) =>
      Math.abs(b.change) - Math.abs(a.change) ||
      b.latestRevenue - a.latestRevenue ||
      a.item.localeCompare(b.item),
  );

  for (const item of largestChanges) {
    if (selectedItems.size >= MAX_EXPLANATION_ITEMS) break;
    selectedItems.set(item.item, {
      name: item.item.replace(/\s+/g, " ").trim().slice(0, 80),
      previousRevenue: item.previousRevenue,
      latestRevenue: item.latestRevenue,
    });
  }

  return {
    previousMonth: {
      label: analysis.previousMonth.label,
      revenue: analysis.previousMonth.revenue,
    },
    latestMonth: {
      label: analysis.latestMonth.label,
      revenue: analysis.latestMonth.revenue,
    },
    items: [...selectedItems.values()],
    omittedItemCount: analysis.itemComparisons.length - selectedItems.size,
  };
}
