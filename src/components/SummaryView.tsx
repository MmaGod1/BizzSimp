import Link from "next/link";
import type { SalesAnalysisSuccess } from "@/lib/analyzeSales";
import type { SalesCopy } from "@/lib/salesCopy";

type SummaryViewProps = {
  analysis: SalesAnalysisSuccess;
  copy: SalesCopy;
  skippedRows: number[];
  onReset: () => void;
};

export function SummaryView({
  analysis,
  copy,
  skippedRows,
  onReset,
}: SummaryViewProps) {
  return (
    <main className="page-shell">
      <Link className="brand" href="/" aria-label="BizzSimp home">
        <span className="brand-mark" aria-hidden="true">
          b
        </span>
        BizzSimp
      </Link>

      <header className="summary-header">
        <p className="eyebrow">Your sales, made simple</p>
        <p className="month-label">
          {analysis.previousMonth.label} <span aria-hidden="true">→</span>{" "}
          {analysis.latestMonth.label}
        </p>
        <h1 className="lead-summary">{copy.headline}</h1>
      </header>

      {(analysis.hasCurrentMonthData || skippedRows.length > 0) && (
        <div className="notice-list" aria-label="Sales data notes">
          {analysis.hasCurrentMonthData && (
            <p className="notice">
              Sales from this month are not included because the month is still
              in progress.
            </p>
          )}
          {skippedRows.length > 0 && (
            <p className="notice">
              We skipped {skippedRows.length} row
              {skippedRows.length === 1 ? "" : "s"} we couldn’t read (row
              {skippedRows.length === 1 ? "" : "s"}{" "}
              {skippedRows.join(", ")}).
            </p>
          )}
        </div>
      )}

      <section className="result-grid" aria-label="Your sales summary">
        <article className="result-card card-selling">
          <h2>What’s selling</h2>
          {copy.selling.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>
        <article className="result-card card-slowing">
          <h2>What’s slowing down</h2>
          {copy.slowing.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </article>
        <article className="result-card card-next">
          <h2>What to do next</h2>
          <p>{copy.suggestion}</p>
        </article>
      </section>

      <div className="reset-row">
        <button className="button" type="button" onClick={onReset}>
          Try another file
        </button>
      </div>
    </main>
  );
}
