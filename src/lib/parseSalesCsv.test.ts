import { describe, expect, it } from "vitest";
import { parseSalesCsv } from "@/lib/parseSalesCsv";

describe("parseSalesCsv", () => {
  it("reads valid rows and ignores a completely blank row", () => {
    const result = parseSalesCsv(
      "date,item,quantity,price\n2026-08-05,Ankara dress,3,30000\n\n2026-09-05,Tote bag,2,12000",
    );

    expect(result).toEqual({
      kind: "success",
      rows: [
        {
          date: "2026-08-05",
          item: "Ankara dress",
          quantity: 3,
          price: 30000,
        },
        { date: "2026-09-05", item: "Tote bag", quantity: 2, price: 12000 },
      ],
      skippedRowNumbers: [],
    });
  });

  it("reports required headers that are missing", () => {
    expect(parseSalesCsv("date,item,quantity\n2026-08-05,Ankara dress,3")).toEqual({
      kind: "missing-headers",
      missingHeaders: ["price"],
    });
  });

  it("skips invalid dates and negative numbers with their CSV row numbers", () => {
    const result = parseSalesCsv(
      "date,item,quantity,price\nnot-a-date,Ankara dress,3,30000\n2026-09-05,Tote bag,-2,12000\n2026-09-08,Scarf,1,9000",
    );

    expect(result).toEqual({
      kind: "success",
      rows: [{ date: "2026-09-08", item: "Scarf", quantity: 1, price: 9000 }],
      skippedRowNumbers: [2, 3],
    });
  });
});
