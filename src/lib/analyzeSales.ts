import type { SaleRow } from "@/lib/parseSalesCsv";

export type MonthlySales = {
  id: string;
  label: string;
  revenue: number;
  units: number;
};

export type ItemComparison = {
  item: string;
  previousRevenue: number;
  latestRevenue: number;
  latestUnits: number;
  change: number;
};

export type SalesAnalysisSuccess = {
  kind: "success";
  previousMonth: MonthlySales;
  latestMonth: MonthlySales;
  revenueChange: number;
  percentageChange: number | null;
  currentMonthLabel: string;
  itemComparisons: ItemComparison[];
  topItems: ItemComparison[];
  slowingItems: ItemComparison[];
  hasCurrentMonthData: boolean;
};

export type SalesAnalysis =
  | SalesAnalysisSuccess
  | { kind: "insufficient-months"; hasCurrentMonthData: boolean }
  | { kind: "no-sales"; hasCurrentMonthData: boolean };

function monthId(date: string): string {
  return date.slice(0, 7);
}

function formatMonth(id: string): string {
  const [year, month] = id.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function analyzeSales(
  rows: SaleRow[],
  referenceDate = new Date(),
): SalesAnalysis {
  const currentMonthId = `${referenceDate.getFullYear()}-${String(
    referenceDate.getMonth() + 1,
  ).padStart(2, "0")}`;
  const hasCurrentMonthData = rows.some(
    (row) => monthId(row.date) === currentMonthId,
  );
  const completedMonthIds = [
    ...new Set(
      rows
        .map((row) => monthId(row.date))
        .filter((id) => id < currentMonthId),
    ),
  ].sort();

  if (completedMonthIds.length < 2) {
    return { kind: "insufficient-months", hasCurrentMonthData };
  }

  const previousMonthId = completedMonthIds[completedMonthIds.length - 2];
  const latestMonthId = completedMonthIds[completedMonthIds.length - 1];
  const previousRows = rows.filter(
    (row) => monthId(row.date) === previousMonthId,
  );
  const latestRows = rows.filter((row) => monthId(row.date) === latestMonthId);
  const previousRevenue = previousRows.reduce(
    (sum, row) => sum + row.quantity * row.price,
    0,
  );
  const latestRevenue = latestRows.reduce(
    (sum, row) => sum + row.quantity * row.price,
    0,
  );
  const previousUnits = previousRows.reduce((sum, row) => sum + row.quantity, 0);
  const latestUnits = latestRows.reduce((sum, row) => sum + row.quantity, 0);

  if (previousRevenue === 0 && latestRevenue === 0) {
    return { kind: "no-sales", hasCurrentMonthData };
  }

  const byItem = new Map<
    string,
    { previousRevenue: number; latestRevenue: number; latestUnits: number }
  >();
  for (const row of [...previousRows, ...latestRows]) {
    const entry = byItem.get(row.item) ?? {
      previousRevenue: 0,
      latestRevenue: 0,
      latestUnits: 0,
    };
    if (monthId(row.date) === previousMonthId) {
      entry.previousRevenue += row.quantity * row.price;
    } else {
      entry.latestRevenue += row.quantity * row.price;
      entry.latestUnits += row.quantity;
    }
    byItem.set(row.item, entry);
  }

  const itemComparisons = [...byItem.entries()]
    .map(([item, values]) => ({
      item,
      ...values,
      change: values.latestRevenue - values.previousRevenue,
    }))
    .sort(
      (a, b) =>
        b.latestRevenue - a.latestRevenue || a.item.localeCompare(b.item),
    );
  const revenueChange = latestRevenue - previousRevenue;

  return {
    kind: "success",
    previousMonth: {
      id: previousMonthId,
      label: formatMonth(previousMonthId),
      revenue: previousRevenue,
      units: previousUnits,
    },
    latestMonth: {
      id: latestMonthId,
      label: formatMonth(latestMonthId),
      revenue: latestRevenue,
      units: latestUnits,
    },
    revenueChange,
    percentageChange:
      previousRevenue === 0 ? null : (revenueChange / previousRevenue) * 100,
    currentMonthLabel: formatMonth(currentMonthId),
    itemComparisons,
    topItems: itemComparisons.filter((item) => item.latestRevenue > 0).slice(0, 3),
    slowingItems: itemComparisons
      .filter((item) => item.latestRevenue < item.previousRevenue)
      .sort(
        (a, b) =>
          b.previousRevenue -
          b.latestRevenue -
          (a.previousRevenue - a.latestRevenue),
      ),
    hasCurrentMonthData,
  };
}
