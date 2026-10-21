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
      setMessage(`This file is missing the required column${parsed.missingHeaders.length === 1 ? "" : "s"}: ${parsed.missingHeaders.join(", ")}.`);
      return;
    }

    if (parsed.kind === "no-usable-rows") {
      setMessage("We couldn't find usable sales rows. Check the date, item, quantity, and price in your CSV, then try again.");
      return;
    }

    const result = analyzeSales(parsed.rows);
    if (result.kind === "insufficient-months") {
      setMessage("We need sales from at least two completed months to make a fair comparison. Add more monthly data and try again.");
      return;
    }
    if (result.kind === "no-sales") {
      setMessage("There isn't enough sales revenue in those months to make a useful summary. Check your quantities and prices, then try again.");
      return;
    }

    setAnalysis(result);
    setCopy(writeSalesCopy(result));
    setSkippedRows(parsed.skippedRowNumbers);
    setMessage("");
  }

  async function handleFileSelected(file: File) {
    setIsProcessing(true);
    setMessage("");
    setAnalysis(null);
    setCopy(null);

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
    setMessage("");
    try {
      summarize(generateSampleCsv());
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
