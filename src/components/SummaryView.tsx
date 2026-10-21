import { Logo } from "@/components/Logo";
import type { SalesAnalysisSuccess } from "@/lib/analyzeSales";
import type { SalesCopy } from "@/lib/salesCopy";

type SummaryViewProps = {
  analysis: SalesAnalysisSuccess;
  copy: SalesCopy;
  skippedRows: number[];
  onReset: () => void;
};

function highlightHeadlineFigures(text: string) {
  return text.split(/(₦[\d,]+|\d+%)/g).map((part, index) =>
    /^₦[\d,]+$|^\d+%$/.test(part) ? (
      <strong className="hero-figure" key={index}>
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function SellingLine({ line }: { line: string }) {
  const match = /^(.+?): (₦[\d,]+) from (.+)\.$/.exec(line);
  if (!match) return <p>{line}</p>;

  const [, item, amount, units] = match;
  return (
    <p className="item-row">
      <strong className="item-name">{item}:</strong>{" "}
      <strong className="item-amount">{amount}</strong>{" "}
      <span className="item-units">from {units}.</span>
    </p>
  );
}

function SlowingLine({ line }: { line: string }) {
  const match = /^(.+?): (.+)$/.exec(line);
  if (!match) return <p>{line}</p>;

  const [, item, details] = match;
  const parts = details.split(/(₦[\d,]+)/g);
  return (
    <p className="item-row">
      <strong className="item-name">{item}:</strong>{" "}
      {parts.map((part, index) =>
        /^₦[\d,]+$/.test(part) ? (
          <strong className="item-amount" key={index}>
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </p>
  );
}

function SellingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 16 5-5 4 4 7-8" />
      <path d="M14 7h6v6" />
    </svg>
  );
}

function SlowingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 8 5 5 4-4 7 8" />
      <path d="M14 17h6v-6" />
    </svg>
  );
}

function NextStepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M9 18h6m-5 4h4m-6-7.5a6.5 6.5 0 1 1 8 0c-.8.6-1.3 1.5-1.4 2.5h-5.2c-.1-1-.6-1.9-1.4-2.5Z" />
    </svg>
  );
}

function formatRowNumbers(rowNumbers: number[]) {
  const visibleRows = rowNumbers.slice(0, 10);
  const lastVisibleRow = visibleRows.pop();
  const remainingRows = rowNumbers.length - 10;
  const listedRows =
    remainingRows > 0
      ? [...visibleRows, lastVisibleRow].join(", ")
      : visibleRows.length > 0
        ? `${visibleRows.join(", ")} and ${lastVisibleRow}`
        : String(lastVisibleRow);

  return `${listedRows}${remainingRows > 0 ? ` and ${remainingRows} more` : ""}`;
}

export function SummaryView({
  analysis,
  copy,
  skippedRows,
  onReset,
}: SummaryViewProps) {
  return (
    <main className="page-shell summary-page">
      <Logo />

      <header className="summary-header hero-panel">
        <p className="month-pill">
          {analysis.previousMonth.label} <span aria-hidden="true">→</span>{" "}
          {analysis.latestMonth.label}
        </p>
        <h1 className="lead-summary">
          {highlightHeadlineFigures(copy.headline)}
        </h1>
      </header>

      {(analysis.hasCurrentMonthData || skippedRows.length > 0) && (
        <div
          className="notice-list"
          aria-label="Sales data notes"
          role="status"
        >
          {analysis.hasCurrentMonthData && (
            <p className="notice notice-current">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" />
              </svg>
              {analysis.currentMonthLabel} isn’t finished yet, so it wasn’t
              included.
            </p>
          )}
          {skippedRows.length > 0 && (
            <p className="notice">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5m0-8h.01" />
              </svg>
              We skipped {skippedRows.length} row
              {skippedRows.length === 1 ? " because" : "s because"} we
              couldn’t read {skippedRows.length === 1 ? "it" : "them"} (row
              {skippedRows.length === 1 ? "" : "s"}{" "}
              {formatRowNumbers(skippedRows)}).
            </p>
          )}
        </div>
      )}

      <section className="result-grid" aria-label="Your sales summary">
        <article className="result-card card-selling motion-reduce:transition-none motion-reduce:hover:transform-none">
          <div className="card-heading">
            <span className="card-icon">
              <SellingIcon />
            </span>
            <h2>What’s selling</h2>
          </div>
          {copy.selling.map((line) => (
            <SellingLine key={line} line={line} />
          ))}
        </article>
        <article className="result-card card-slowing motion-reduce:transition-none motion-reduce:hover:transform-none">
          <div className="card-heading">
            <span className="card-icon">
              <SlowingIcon />
            </span>
            <h2>What’s slowing down</h2>
          </div>
          {copy.slowing.map((line) => (
            <SlowingLine key={line} line={line} />
          ))}
        </article>
        <article className="result-card card-next motion-reduce:transition-none motion-reduce:hover:transform-none">
          <div className="card-heading">
            <span className="card-icon">
              <NextStepIcon />
            </span>
            <h2>What to do next</h2>
          </div>
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
