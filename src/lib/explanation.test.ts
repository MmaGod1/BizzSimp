import { describe, expect, it } from "vitest";
import { analyzeSales } from "@/lib/analyzeSales";
import { createExplanationRequest } from "@/lib/explanation";
import type { SaleRow } from "@/lib/parseSalesCsv";

describe("createExplanationRequest", () => {
  it("sends monthly aggregates without transaction dates or unit counts", () => {
    const rows: SaleRow[] = [
      { date: "2026-08-05", item: "Dress", quantity: 2, price: 100 },
      { date: "2026-09-05", item: "Dress", quantity: 3, price: 100 },
    ];
    const analysis = analyzeSales(rows, new Date(2026, 9, 21));

    expect(analysis.kind).toBe("success");
    if (analysis.kind !== "success") return;

    const request = createExplanationRequest(analysis);
    expect(request).toEqual({
      previousMonth: { label: "August 2026", revenue: 200 },
      latestMonth: { label: "September 2026", revenue: 300 },
      items: [{ name: "Dress", previousRevenue: 200, latestRevenue: 300 }],
      omittedItemCount: 0,
    });
    expect(JSON.stringify(request)).not.toContain("2026-08-05");
    expect(JSON.stringify(request)).not.toContain("quantity");
  });

  it("limits item details to the top sellers and largest revenue changes", () => {
    const rows: SaleRow[] = [];
    for (let index = 0; index < 20; index += 1) {
      rows.push(
        {
          date: "2026-08-05",
          item: `Item ${index}`,
          quantity: 10,
          price: 100,
        },
        {
          date: "2026-09-05",
          item: `Item ${index}`,
          quantity: index,
          price: 100,
        },
      );
    }
    const analysis = analyzeSales(rows, new Date(2026, 9, 21));

    expect(analysis.kind).toBe("success");
    if (analysis.kind !== "success") return;

    const request = createExplanationRequest(analysis);
    expect(request.items).toHaveLength(12);
    expect(request.items.slice(0, 3).map((item) => item.name)).toEqual([
      "Item 19",
      "Item 18",
      "Item 17",
    ]);
    expect(request.omittedItemCount).toBe(8);
  });
});
