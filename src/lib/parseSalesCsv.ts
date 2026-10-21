import Papa from "papaparse";

export const REQUIRED_HEADERS = ["date", "item", "quantity", "price"] as const;

export type SaleRow = {
  date: string;
  item: string;
  quantity: number;
  price: number;
};

export type ParseSalesCsvResult =
  | { kind: "success"; rows: SaleRow[]; skippedRowNumbers: number[] }
  | { kind: "missing-headers"; missingHeaders: string[] }
  | { kind: "empty-file" }
  | { kind: "parse-error" }
  | { kind: "no-usable-rows"; skippedRowNumbers: number[] };

function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

function parseNonNegativeNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const number = Number(value.trim());
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function parseSalesCsv(csvText: string): ParseSalesCsvResult {
  if (csvText.trim() === "") return { kind: "empty-file" };

  let result: Papa.ParseResult<Record<string, string>>;
  try {
    result = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: false,
      transformHeader: (header) => header.trim().toLowerCase(),
    });
  } catch {
    return { kind: "parse-error" };
  }

  if (result.errors.some((error) => error.type !== "FieldMismatch")) {
    return { kind: "parse-error" };
  }

  const headers = result.meta.fields ?? [];
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header),
  );

  if (missingHeaders.length > 0) {
    return { kind: "missing-headers", missingHeaders: [...missingHeaders] };
  }

  const rows: SaleRow[] = [];
  const skippedRowNumbers: number[] = [];

  result.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const values = REQUIRED_HEADERS.map((header) => row[header] ?? "");
    if (values.every((value) => value.trim() === "")) return;

    const [dateValue, itemValue, quantityValue, priceValue] = values;
    const date = dateValue.trim();
    const item = itemValue.trim();
    const quantity = parseNonNegativeNumber(quantityValue);
    const price = parseNonNegativeNumber(priceValue);

    if (
      !isValidDate(date) ||
      item === "" ||
      quantity === null ||
      price === null
    ) {
      skippedRowNumbers.push(rowNumber);
      return;
    }

    rows.push({ date, item, quantity, price });
  });

  if (rows.length === 0) {
    return { kind: "no-usable-rows", skippedRowNumbers };
  }

  return { kind: "success", rows, skippedRowNumbers };
}
