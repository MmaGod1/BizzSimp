"use client";

import { useState } from "react";
import { SummaryView } from "@/components/SummaryView";
import { UploadView } from "@/components/UploadView";
import { analyzeSales, type SalesAnalysis } from "@/lib/analyzeSales";
import { parseSalesCsv } from "@/lib/parseSalesCsv";
import { generateSampleCsv } from "@/lib/sampleCsv";
import { writeSalesCopy, type SalesCopy } from "@/lib/salesCopy";

export default function Home() {
  const [analysis, setAnalysis] = useState<SalesAnalysis | null>(null);
  const [copy, setCopy] = useState<SalesCopy | null>(null);
  const [skippedRows, setSkippedRows] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  function summarize(csvText: string) {
    const parsed = parseSalesCsv(csvText);

    if (parsed.kind === "missing-headers") {
      const headerList =
        parsed.missingHeaders.length === 1
          ? parsed.missingHeaders[0]
          : `${parsed.missingHeaders.slice(0, -1).join(", ")} and ${parsed.missingHeaders[parsed.missingHeaders.length - 1]}`;
      setMessage(
        `This file is missing the required column${parsed.missingHeaders.length === 1 ? "" : "s"}: ${headerList}. Expected headers: date, item, quantity, price. Example row: 2026-05-14,Ankara dress,2,30000.`,
      );
      return;
    }

    if (parsed.kind === "empty-file") {
      setMessage("This file is empty. BizzSimp needs sales from at least two full months to make a useful comparison. Choose a CSV with sales data and try again.");
      return;
    }

    if (parsed.kind === "parse-error") {
      setMessage("We couldn't parse this file as a CSV. Check its format and try again.");
      return;
    }

    if (parsed.kind === "no-usable-rows") {
      setMessage("BizzSimp needs sales from at least two full months to make a useful comparison. Check your CSV and try again.");
      return;
    }

    const result = analyzeSales(parsed.rows);
    if (result.kind === "insufficient-months") {
      setMessage("BizzSimp needs sales from at least two full months to make a useful comparison. Add more monthly data and try again.");
      return;
    }
    if (result.kind === "no-sales") {
      setMessage("There isn't enough sales data in those months to make a useful summary. Check your quantities and prices, then try again.");
      return;
    }

    setAnalysis(result);
    setCopy(writeSalesCopy(result));
    setSkippedRows(parsed.skippedRowNumbers);
    setMessage("");
  }

  async function handleFileSelected(file: File) {
    setMessage("");
    setAnalysis(null);
    setCopy(null);
    setSkippedRows([]);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setMessage("That file doesn't look like a CSV. Choose a .csv file and try again.");
      return;
    }

    setIsProcessing(true);
    try {
      summarize(await file.text());
    } catch {
      setMessage("We couldn't read that file. Please check that it's a CSV and try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleSampleData() {
    setIsProcessing(true);
    setAnalysis(null);
    setCopy(null);
    setSkippedRows([]);
    setMessage("");
    try {
      summarize(generateSampleCsv());
    } catch {
      setMessage("We couldn't prepare the sample data. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  function reset() {
    setAnalysis(null);
    setCopy(null);
    setSkippedRows([]);
    setMessage("");
  }

  if (analysis?.kind === "success" && copy) {
    return (
      <SummaryView
        analysis={analysis}
        copy={copy}
        skippedRows={skippedRows}
        onReset={reset}
      />
    );
  }

  return (
    <UploadView
      message={message}
      isProcessing={isProcessing}
      onFileSelected={handleFileSelected}
      onSampleData={handleSampleData}
    />
  );
}
