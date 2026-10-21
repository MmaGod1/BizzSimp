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

  it("recognizes an empty file", () => {
    expect(parseSalesCsv(" \r\n\t")).toEqual({ kind: "empty-file" });
  });

  it("reports malformed CSV quoting as a parse error", () => {
    expect(
      parseSalesCsv('date,item,quantity,price\n"2026-08-05,Dress,1,200'),
    ).toEqual({ kind: "parse-error" });
  });

  it("skips invalid dates and negative numbers with their CSV row numbers", () => {
    const result = parseSalesCsv(
      "date,item,quantity,price\nnot-a-date,Ankara dress,3,30000\n\n2026-09-05,Tote bag,-2,12000\n2026-09-08,Scarf,1,9000",
    );

    expect(result).toEqual({
      kind: "success",
      rows: [{ date: "2026-09-08", item: "Scarf", quantity: 1, price: 9000 }],
      skippedRowNumbers: [2, 4],
    });
  });

  it("skips invalid dates and missing or non-numeric values without rejecting good rows", () => {
    const result = parseSalesCsv(
      "date,item,quantity,price\n2026-02-30,Dress,1,200\n2026-08-05,Scarf,,200\n2026-08-06,Bag,one,200\n2026-08-07,Hat,1,\n2026-08-08,Coat,1,not-a-price\n2026-08-09,Cap,1,-5\n2026-08-10,Tote,2,100",
    );

    expect(result).toEqual({
      kind: "success",
      rows: [{ date: "2026-08-10", item: "Tote", quantity: 2, price: 100 }],
      skippedRowNumbers: [2, 3, 4, 5, 6, 7],
    });
  });

  it("explains when no usable rows remain", () => {
    expect(
      parseSalesCsv(
        "date,item,quantity,price\n2026-02-30,Dress,1,200\n2026-08-05,,1,200",
      ),
    ).toEqual({ kind: "no-usable-rows", skippedRowNumbers: [2, 3] });
  });

  it("normalizes whitespace and case in the required headers", () => {
    expect(
      parseSalesCsv(" Date , ITEM , Quantity , Price \n2026-08-05,Dress,1,200"),
    ).toMatchObject({
      kind: "success",
      rows: [{ date: "2026-08-05", item: "Dress", quantity: 1, price: 200 }],
    });
  });
});
