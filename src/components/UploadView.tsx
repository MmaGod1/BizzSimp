import Link from "next/link";

type UploadViewProps = {
  message: string;
  isProcessing: boolean;
  onFileSelected: (file: File) => void;
  onSampleData: () => void;
};

export function UploadView({
  message,
  isProcessing,
  onFileSelected,
  onSampleData,
}: UploadViewProps) {
  return (
    <main className="page-shell">
      <Link className="brand" href="/" aria-label="BizzSimp home">
        <span className="brand-mark" aria-hidden="true">
          b
        </span>
        BizzSimp
      </Link>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">A clearer view of your sales</p>
        <h1 id="page-title">Turn your sales into simple advice.</h1>
        <p className="intro-copy">
          See what sold, what changed, and one practical next step — all from a
          simple sales file.
        </p>
      </section>

      <section className="upload-panel" aria-label="Upload sales data">
        <label className="drop-area" htmlFor="sales-file">
          <input
            id="sales-file"
            type="file"
            accept=".csv,text/csv"
            disabled={isProcessing}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) onFileSelected(file);
              event.currentTarget.value = "";
            }}
          />
          <span>
            <span className="upload-icon" aria-hidden="true">
              ↑
            </span>
            <span className="drop-title">
              {isProcessing ? "Reading your sales file…" : "Choose a sales CSV"}
            </span>
            <span className="drop-help">Use a file from your device</span>
          </span>
        </label>

        <button
          className="button-secondary"
          type="button"
          disabled={isProcessing}
          onClick={onSampleData}
        >
          Try with sample data
        </button>

        {message && (
          <p className="message" role="alert">
            {message}
          </p>
        )}

        <p className="format-note">
          <strong>CSV format</strong>
          <br />
          Include <code>date</code>, <code>item</code>, <code>quantity</code>,
          and <code>price</code>. Use dates in YYYY-MM-DD format.
          <code className="example-row">
            date,item,quantity,price
            <br />
            2026-05-14,Ankara dress,2,30000
          </code>
        </p>
        <p className="privacy-note">
          Your file is read in this browser and is not saved or uploaded.
        </p>
      </section>
    </main>
  );
}
