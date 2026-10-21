import { describe, expect, it } from "vitest";
import { analyzeSales } from "@/lib/analyzeSales";
import type { SaleRow } from "@/lib/parseSalesCsv";
import { parseSalesCsv } from "@/lib/parseSalesCsv";
import { generateSampleCsv } from "@/lib/sampleCsv";
import { writeSalesCopy } from "@/lib/salesCopy";

const referenceDate = new Date(2026, 9, 21);

describe("analyzeSales", () => {
  it("generates a fictional sample that can be summarized through the same parser", () => {
    const parsed = parseSalesCsv(generateSampleCsv(referenceDate));

    expect(parsed.kind).toBe("success");
    if (parsed.kind !== "success") return;
    const result = analyzeSales(parsed.rows, referenceDate);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.previousMonth.id).toBe("2026-08");
    expect(result.latestMonth.id).toBe("2026-09");
    expect(result.hasCurrentMonthData).toBe(true);
    expect(writeSalesCopy(result).slowing.join(" ")).toContain("Silk scarf");
  });

  it("compares the two latest completed months and leaves out the current month", () => {
    const rows: SaleRow[] = [
      { date: "2026-08-05", item: "Dress", quantity: 2, price: 100 },
      { date: "2026-09-05", item: "Dress", quantity: 3, price: 100 },
      { date: "2026-10-05", item: "Dress", quantity: 8, price: 100 },
    ];

    const result = analyzeSales(rows, referenceDate);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.previousMonth.label).toBe("August 2026");
    expect(result.latestMonth.label).toBe("September 2026");
    expect(result.latestMonth.revenue).toBe(300);
    expect(result.hasCurrentMonthData).toBe(true);
  });

  it("requires two completed months and rejects two months with no revenue", () => {
    expect(
      analyzeSales(
        [{ date: "2026-09-05", item: "Dress", quantity: 1, price: 100 }],
        referenceDate,
      ),
    ).toEqual({ kind: "insufficient-months", hasCurrentMonthData: false });

    expect(
      analyzeSales(
        [
          { date: "2026-08-05", item: "Dress", quantity: 0, price: 100 },
          { date: "2026-09-05", item: "Dress", quantity: 0, price: 100 },
        ],
        referenceDate,
      ),
    ).toEqual({ kind: "no-sales", hasCurrentMonthData: false });
  });

  it("identifies a growing top seller and an item with no recent sales", () => {
    const result = analyzeSales(
      [
        { date: "2026-08-05", item: "Dress", quantity: 3, price: 30000 },
        { date: "2026-08-05", item: "Scarf", quantity: 4, price: 10000 },
        { date: "2026-09-05", item: "Dress", quantity: 6, price: 30000 },
      ],
      referenceDate,
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.topItems[0]).toMatchObject({
      item: "Dress",
      previousRevenue: 90000,
      latestRevenue: 180000,
      latestUnits: 6,
    });
    expect(result.slowingItems[0]).toMatchObject({
      item: "Scarf",
      previousRevenue: 40000,
      latestRevenue: 0,
    });
    const copy = writeSalesCopy(result);
    expect(copy.headline).toContain("38%");
    expect(copy.headline).toContain("Dress");
    expect(copy.suggestion).toContain("featuring");
    expect(copy.slowing[0]).toContain("Scarf");
  });

  it("explains why percentage change is unavailable when the previous month had zero revenue", () => {
    const result = analyzeSales(
      [
        { date: "2026-08-05", item: "Dress", quantity: 0, price: 100 },
        { date: "2026-09-05", item: "Dress", quantity: 2, price: 100 },
      ],
      referenceDate,
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(result.percentageChange).toBeNull();
    expect(writeSalesCopy(result).headline).toContain("no percentage change");
  });
});
