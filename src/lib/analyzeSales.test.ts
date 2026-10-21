import { describe, expect, it, vi } from "vitest";
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
    expect(result.currentMonthLabel).toBe("October 2026");
    expect(result.hasCurrentMonthData).toBe(true);
    expect(result.previousMonth.revenue).toBe(184000);
    expect(result.latestMonth.revenue).toBe(246000);
    expect(result.topItems.map((item) => item.item)).toEqual([
      "Ankara dress",
      "Linen shirt",
      "Tote bag",
    ]);
    expect(result.slowingItems.map((item) => item.item)).toEqual([
      "Silk scarf",
      "Belts",
    ]);

    const copy = writeSalesCopy(result);
    expect(copy.headline).toContain("34%");
    expect(copy.headline).toContain("Ankara dress");
    expect(copy.slowing).toEqual([
      "Silk scarf: ₦40,000 in August, no sales in September.",
      "Belts: ₦30,000 in August, ₦12,000 in September.",
    ]);
  });

  it("generates sample dates relative to today across calendar years", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2027, 0, 15));

    try {
      const parsed = parseSalesCsv(generateSampleCsv());
      expect(parsed.kind).toBe("success");
      if (parsed.kind !== "success") return;
      expect(
        [...new Set(parsed.rows.map((row) => row.date.slice(0, 7)))].sort(),
      ).toEqual(["2026-11", "2026-12", "2027-01"]);
      expect(parsed.rows.some((row) => row.date === "2027-01-15")).toBe(true);
    } finally {
      vi.useRealTimers();
    }
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
    expect(result.currentMonthLabel).toBe("October 2026");
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
    expect(copy.slowing[0]).toBe(
      "Scarf: ₦40,000 in August, no sales in September.",
    );
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

  it("names both months when revenue falls but sales continue", () => {
    const result = analyzeSales(
      [
        { date: "2026-08-05", item: "Belts", quantity: 3, price: 10000 },
        { date: "2026-09-05", item: "Belts", quantity: 3, price: 4000 },
      ],
      referenceDate,
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(writeSalesCopy(result).slowing).toEqual([
      "Belts: ₦30,000 in August, ₦12,000 in September.",
    ]);
  });

  it("does not attribute a total increase to an item below one third of the increase", () => {
    const rows: SaleRow[] = [];
    for (const item of ["Dress", "Tote", "Scarf", "Hat"]) {
      rows.push(
        { date: "2026-08-05", item, quantity: 1, price: 250 },
        { date: "2026-09-05", item, quantity: 1, price: 300 },
      );
    }
    const result = analyzeSales(rows, referenceDate);

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(writeSalesCopy(result).headline).not.toContain("making the biggest difference");
  });

  it("uses the steady-sales suggestion when the largest item change is at the 10% threshold", () => {
    const result = analyzeSales(
      [
        { date: "2026-08-05", item: "Dress", quantity: 9, price: 100 },
        { date: "2026-08-05", item: "Tote", quantity: 1, price: 100 },
        { date: "2026-09-05", item: "Dress", quantity: 9.5, price: 100 },
        { date: "2026-09-05", item: "Tote", quantity: 0.5, price: 100 },
      ],
      referenceDate,
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(writeSalesCopy(result).suggestion).toContain("Sales look steady");
  });

  it("breaks equal-magnitude suggestion ties using latest-month revenue", () => {
    const result = analyzeSales(
      [
        { date: "2026-08-05", item: "Belt", quantity: 3, price: 10000 },
        { date: "2026-08-05", item: "Dress", quantity: 0, price: 20000 },
        { date: "2026-09-05", item: "Belt", quantity: 1, price: 10000 },
        { date: "2026-09-05", item: "Dress", quantity: 1, price: 20000 },
      ],
      referenceDate,
    );

    expect(result.kind).toBe("success");
    if (result.kind !== "success") return;
    expect(writeSalesCopy(result).suggestion).toContain("Dress");
    expect(writeSalesCopy(result).suggestion).toContain("featuring");
  });
});
