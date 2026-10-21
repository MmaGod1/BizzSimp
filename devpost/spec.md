---
doc: spec
status: approved
---

# BizzSimp — Technical Spec

## How This Works, In Plain Language

The app is one Next.js page with an upload view and a results view. When a seller chooses a CSV, the browser reads it; the file is not sent to a server or saved. Papa Parse turns the CSV text into rows, and our own TypeScript code checks those rows and compares the two latest completed months. A separate sentence-writing function turns the calculated figures into the summary and suggestion, and the page displays them in three simple cards.

The uploaded rows and results stay in the open page only. Trying sample data uses the same path as uploading a file. Starting over clears the current result; refreshing or closing the page clears the file and result too.

Next.js is the framework the learner already knows and Vercel can host the demo. The app uses its browser-side features only for this proof of concept: no database, account, API route, AI service, or server-side CSV processing.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. The page shows the upload instructions, accepted headers, example row, privacy note, and sample-data button (`UploadView`).
2. The seller picks a file or sample data. The page reads the file text in the browser and passes the text to the CSV parser.
3. The parser checks the headers and rows. It ignores blank rows, skips unreadable rows, and returns usable sales rows plus any row-number warnings. Missing headers or no usable rows return a friendly upload-view message instead.
4. The analysis functions select the two most recent completed calendar months in the usable rows, calculate revenue and item changes, and return a typed result. If there are not two completed months, or both months have zero revenue, the page stays on the upload view with an explanation.
5. The sentence-writing functions turn those figures into the opening comparison, result-card content, and one suggestion. The page displays the month names and, when needed, the skipped-row and unfinished-current-month notes.
6. “Try another file” clears the in-memory file and result and returns to the upload view. Nothing is restored after a refresh or when the page is reopened.

```text
CSV file or bundled sample
          │
          ▼
Browser page ──► CSV parsing and validation ──► Sales analysis
     ▲                                              │
     │                                              ▼
     └──────────── Upload or summary view ◄── Sentence writing
```

## Stack

- **Next.js App Router + React** — the learner chose the familiar framework. The upload-and-summary page is a client component because it reads files and updates the page in the browser. Use the App Router structure for a new Next.js app.
- **TypeScript** — used for page data, parsed rows, analysis results, and sentence-writing inputs so the boundaries between modules stay reviewable.
- **Tailwind CSS** — the learner's familiar styling tool, used for the responsive layout and the PRD's calm, warm palette.
- **Papa Parse** — parses the fixed-format CSV in the browser. It is a small focused CSV dependency; it does not upload the file.
- **Vitest** — development-only tests for the CSV parsing/validation and sales analysis modules. No UI tests.
- **npm** — use the npm scripts created with the Next.js project. Versions are not pinned in this spec; check the current Next.js, Tailwind, Papa Parse, and Vitest setup instructions when scaffolding in the build.

## Where It Runs and How Someone Tries It

- **Local development:** Requires Node.js and npm compatible with the current Next.js release. In the project root, run `npm install`, then `npm run dev`, and open `http://localhost:3000`.
- **Demo recording:** Use the local page or its Vercel deployment. Choose “Try with sample data” to demonstrate the complete flow without real customer data; also show the required CSV format and the summary. The sample data is made up.
- **Deployment:** Deploy to Vercel, as chosen by the learner, by connecting the GitHub repository to a Vercel project and using its detected Next.js defaults. Check current Vercel plan limits before deploying. No environment variables or external API keys are needed. Verify the production build and live URL after deployment, then open the live link on a phone and confirm the fictional sample data tells the complete sales story clearly. The demo recording is prepared separately during `6-ship`.
- **Submission:** The live link is optional and supplements—not replaces—the required short demo video and public GitHub repository. Deployment costs and current Vercel plan limits have not been checked; confirm them during `6-ship`.

## Look and Feel

Implements `prd.md > Screens and Layout` and `prd.md > Look and Feel`.

Use a soft warm off-white page, charcoal text, and deep teal for headings, buttons, and the upload area. Keep generous spacing, rounded cards, and readable mobile-first sizing. Use one friendly sans-serif face with a system fallback. The opening comparison is the most prominent text; the “What’s selling” card is gently green, “What’s slowing down” warm amber rather than red, and “What to do next” teal. Keep copy calm and jargon-free, with no charts, dense tables, or dashboard styling.

## Components

### Upload and summary page

`src/app/page.tsx` owns the current view and transient form/result state. It sends a selected file's text or the bundled sample text through the same parser and analysis flow, then chooses whether to show the upload view or summary view. It does not persist data.

PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### Upload view

`src/components/UploadView.tsx` shows the headline, explanation, CSV file input, “Try with sample data” action, required headers, date format, example row, and browser-only/no-storage note. It also shows friendly file and validation errors, including missing headers and insufficient data.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### CSV parsing and validation

`src/lib/parseSalesCsv.ts` accepts CSV text, uses Papa Parse to read the fixed headers, and validates each nonblank data row. It returns either missing-header/errors or valid rows with a list of skipped source row numbers. Blank rows do not produce warnings. Any skipped rows are reported, but valid rows continue through analysis whenever at least one usable row remains; there is no unreadable-row percentage threshold. If no usable rows remain, the page shows the insufficient-data message.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > States and Boundaries`.

### Monthly sales analysis

`src/lib/analyzeSales.ts` receives validated rows and a reference date, chooses the latest two completed calendar months represented in the data, calculates row revenue as quantity times price, and computes the overall and per-item comparisons. It returns structured values rather than display sentences. Current-month rows are excluded from comparisons.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`.

### Sentence writing

`src/lib/salesCopy.ts` receives analysis results and creates the plain-language opening summary, item-card text, and one suggestion. Use deterministic TypeScript templates—no AI call. In the slowing card, name both compared months and use plain wording that distinguishes no latest-month sales from a lower but nonzero result. Preserve the PRD's rules: only name an item in an increasing opening summary when its revenue increase is at least one third of the total increase; use the 10% previous-month-revenue threshold for changed-item suggestions; use the top seller when the previous month's total is zero; and never infer stock or inventory.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`, `prd.md > Non-Goals`.

### Summary view

`src/components/SummaryView.tsx` renders the compared month names, opening sentence, optional unfinished-month/skipped-row notes, and the three cards: “What’s selling,” “What’s slowing down,” and “What to do next.” Its return action asks the page to clear the current result and show the upload view.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`, `prd.md > Return to upload`, `prd.md > States and Boundaries`.

### Sample data

`src/lib/sampleCsv.ts` generates clearly fictional CSV text when “Try with sample data” is clicked. It derives dates from the browser's current date: representative rows in the two previous complete calendar months, plus a row on today in the current month. The current-month row ensures the unfinished-month note appears without introducing future-dated sample transactions. Keep the figures stable and varied enough to show three latest-month sellers, an item with previous-month sales and no latest-month sales, and an item whose revenue declines but remains nonzero, while keeping one item the clear largest mover. The generated text goes through the same parser and analysis functions as an uploaded CSV.

PRD ref: `prd.md > The Core Journey`, `prd.md > CSV upload and validation`, `prd.md > Product Decisions`.

### Focused unit tests

`src/lib/parseSalesCsv.test.ts` tests missing headers, skipped unreadable rows and their row numbers, and blank rows being ignored without a warning. `src/lib/analyzeSales.test.ts` tests selecting the latest two completed months, the zero-revenue previous-month case, the 10% steady threshold, the one-third opening-summary rule, and choosing the next-step suggestion (including the specified tie-break where useful). Run them with `npm test`. No UI tests are in scope.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`.

## Data Model

All sales data and UI state live temporarily in browser memory:

- **Validated sale:** `date` as a validated calendar date, `item` as text, and nonnegative numeric `quantity` and `price`.
- **Parse result:** either missing required headers, no usable rows, or usable sale rows plus skipped CSV row numbers.
- **Analysis result:** the previous and latest completed month identifiers/totals, overall revenue change, per-item revenue and unit totals, the ranked latest-month items, slowing items, and the values needed to choose a suggestion.
- **Page state:** upload or summary view, current message/warnings, and current analysis result.

The fictional sample CSV is generated as a string in the browser when requested. Selecting a file reads its text in the browser; it is not posted to Vercel or another service. The parser and analysis functions return data to the page, which renders it. “Try another file” clears the current result; leaving, refreshing, or closing the page discards all uploaded data and results. No local storage, cookies for sales data, database, or saved history is used.

## File Structure

The repository currently contains the `devpost/` planning documents and skill files, but no Next.js application scaffold. Add the application files below while preserving those existing documents.

```text
BizzSimp/
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind setup and page color/type styling
│   │   ├── layout.tsx               # Root HTML layout and global stylesheet
│   │   └── page.tsx                 # Client page state and upload-to-summary flow
│   ├── components/
│   │   ├── UploadView.tsx           # Upload, sample action, instructions, messages
│   │   └── SummaryView.tsx          # Month comparison and three result cards
│   └── lib/
│       ├── analyzeSales.ts          # Pure monthly and per-item calculations
│       ├── analyzeSales.test.ts     # Focused sales-analysis tests
│       ├── parseSalesCsv.ts         # CSV parsing and row/header validation
│       ├── parseSalesCsv.test.ts    # Focused parser/validation tests
│       ├── salesCopy.ts             # Deterministic user-facing sentence templates
│       └── sampleCsv.ts             # Generates current-date-relative fictional demo CSV
├── public/                          # Static app assets, if scaffolded
├── devpost/                         # Existing planning and submission documents
├── package.json                     # Dependencies and dev/build/test scripts
├── package-lock.json                # npm dependency lockfile
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration, if generated
├── postcss.config.mjs               # Tailwind/PostCSS configuration, if generated
└── vitest.config.ts                 # Vitest configuration
```

## External Services and Dependencies

- [Next.js documentation](https://nextjs.org/docs) — App Router and client component conventions. No Next.js API route is needed.
- [React documentation](https://react.dev/learn) — page and component behavior.
- [TypeScript documentation](https://www.typescriptlang.org/docs/) — typed data and pure logic modules.
- [Tailwind CSS documentation](https://tailwindcss.com/docs) — styling. Use the version/configuration generated for the chosen Next.js setup.
- [Papa Parse documentation](https://www.papaparse.com/docs) — parse CSV text in the browser; no endpoint, account, key, or external request.
- [Vitest documentation](https://vitest.dev/guide/) — run the two pure-module test files; no external service.
- [Vercel Next.js documentation](https://vercel.com/docs/frameworks/nextjs) — host the public demo. Vercel serves the app; the CSV is not uploaded to a Vercel function or stored there. No API calls, payloads, credentials, or rate limits are part of the app.

## Important Failure Modes

- **Missing required headers or unreadable CSV** → stay on the upload view and name the missing headers or explain that the file could not be read; do not render a misleading summary.
- **Some malformed rows** → skip only the unreadable rows, show their count and source row numbers, and continue with usable rows. Completely blank rows are ignored silently.
- **No usable rows, fewer than two completed months, or both compared months have zero revenue** → stay on the upload view with the specific friendly explanation required by the PRD.
- **File read or parse exception** → show a clear upload error and allow another file to be selected; do not silently fall back to a successful-looking result.

## What Was Simplified and Why

- **Browser memory instead of accounts, a database, or saved reports** — the proof of concept is one upload-and-summary flow and must not retain customer data. A later product could add persistence only with an explicit privacy and product decision.
- **Fixed CSV headers and date format instead of column matching** — keeps validation understandable and the six-day build focused.
- **Ordinary comparisons plus deterministic sentence templates instead of AI-generated analysis or wording** — calculations remain explainable and grounded in the file, and the separate writing module can be revisited later without changing the analysis.
- **No charts, dashboards, inventory data, or stockout advice** — these do not prove the unique kernel and sales alone cannot support inventory claims.
- **Fictional bundled sample data instead of real customer data** — supports a complete demo while protecting the client.

## Decisions and Open Issues

- **Learner choice — Next.js App Router, TypeScript, and Tailwind CSS:** use tools the learner already knows, enabling them to review generated code. The tradeoff is a little framework structure beyond a plain static page.
- **Learner choice — client-side CSV processing with Papa Parse:** avoids sending or saving seller data and uses a small, focused parsing dependency.
- **Learner choice — Vercel deployment:** provide a live demo link in addition to the required public GitHub repository and short video. No app secrets are needed.
- **Learner choice — focused Vitest tests:** test parsing/validation and sales analysis modules, not the UI.
- **Resolved uncertainty — AI-generated wording versus code-generated insights:** the approved scope chose ordinary code comparisons and a separate template-writing step because it is free to run, easier to explain, and keeps claims grounded in uploaded data. No AI is used in this POC.
- **Resolved product-rule clarification — unreadable-row threshold:** the PRD's approved behavior remains authoritative. Skip unreadable rows and continue whenever usable rows remain; show row numbers. Do not reject a file based on the percentage of unreadable rows.
- **Implementation detail — module boundaries:** keep CSV parsing/validation, analysis, and user-facing sentence templates in separate TypeScript files so each is reviewable and the first two can be tested without the UI.
- **To verify early in the build:** confirm current Next.js/Node compatibility and the generated Tailwind configuration when scaffolding. Confirm that the parser's row numbering matches the CSV rows shown to users. Check the current Vercel plan limits during deployment; no current pricing or plan limit was researched for this spec.
- **No other product questions are blocking:** `prd.md > Open Questions` says none are blocking.
