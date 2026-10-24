---
doc: spec
status: approved
---

# BizzSimp — Technical Spec

## How This Works, In Plain Language

The app is one Next.js page with an upload view and a results view. When a seller chooses a CSV, the browser reads it; the file is not sent to a server or saved. Papa Parse turns the CSV text into rows, and our own TypeScript code checks those rows and compares the two latest completed months. A separate sentence-writing function turns the calculated figures into the summary and suggestion, and the page displays them in three simple cards. Following the learner's scope change from the original no-AI POC, local development and controlled demos may use an optional Groq explanation route that receives only monthly and selected item revenue aggregates; the model does not calculate or change the results. Do not enable this integration in the public production deployment.

The uploaded rows and results stay in the open page only. Trying sample data uses the same path as uploading a file. Starting over clears the current result; refreshing or closing the page clears the file and result too.

Next.js is the framework the learner already knows and Vercel can host the demo. There is no database, user account, or server-side CSV processing. One Next.js Route Handler calls Groq only when the seller requests an explanation and a development/demo server key is configured; the production Vercel deployment must not have that key.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. The page shows the upload instructions, accepted headers, example row, privacy note, and sample-data button (`UploadView`).
2. The seller picks a file or sample data. The page reads the file text in the browser and passes the text to the CSV parser.
3. The parser checks the headers and rows. It ignores blank rows, skips unreadable rows, and returns usable sales rows plus any row-number warnings. Missing headers or no usable rows return a friendly upload-view message instead.
4. The analysis functions select the two most recent completed calendar months in the usable rows, calculate revenue and item changes, and return a typed result. If there are not two completed months, or both months have zero revenue, the page stays on the upload view with an explanation.
5. The sentence-writing functions turn those figures into the opening comparison, result-card content, and one suggestion. The page displays the month names and, when needed, the skipped-row and unfinished-current-month notes.
6. If requested, the page sends only the compared month labels and revenue totals and up to 12 item names with their monthly revenue totals to `src/app/api/explain/route.ts`. The Groq key stays on the server. The route asks Groq for a short explanation and returns the text; it does not send the CSV, transaction dates, or units.
7. “Try another file” clears the in-memory file, result, and explanation and returns to the upload view. Nothing is restored after a refresh or when the page is reopened.

```text
CSV file or bundled sample
          │
          ▼
Browser page ──► CSV parsing and validation ──► Sales analysis
     ▲                                              │
     │                                              ▼
     └──────────── Upload or summary view ◄── Sentence writing
                         │
                         └── on request: aggregate-only Groq explanation
```

## Stack

- **Next.js App Router + React** — the learner chose the familiar framework. The upload-and-summary page is a client component because it reads files and updates the page in the browser. Use the App Router structure for a new Next.js app.
- **TypeScript** — used for page data, parsed rows, analysis results, and sentence-writing inputs so the boundaries between modules stay reviewable.
- **Tailwind CSS** — the learner's familiar styling tool, used for the responsive layout and the PRD's calm, warm palette.
- **Papa Parse** — parses the fixed-format CSV in the browser. It is a small focused CSV dependency; it does not upload the file.
- **Groq API** — optional development/demo-only explanation through a Next.js Route Handler using the OpenAI-compatible chat completions endpoint. The model is `openai/gpt-oss-20b`; no SDK dependency is needed. Configure the server-only `GROQ_API_KEY` in `.env.local` for local use only. Do not add the key to Vercel production settings.
- **Vitest** — development-only tests for the CSV parsing/validation and sales analysis modules. No UI tests.
- **npm** — use the npm scripts created with the Next.js project. Versions are not pinned in this spec; check the current Next.js, Tailwind, Papa Parse, and Vitest setup instructions when scaffolding in the build.

## Where It Runs and How Someone Tries It

- **Local development:** Requires Node.js and npm compatible with the current Next.js release. In the project root, run `npm install`, then `npm run dev`, and open `http://localhost:3000`.
- **Demo recording:** Use the local page or its Vercel deployment. Choose “Try with sample data” to demonstrate the complete flow without real customer data; also show the required CSV format and the summary. The sample data is made up.
- **Deployment:** Deploy to Vercel, as chosen by the learner, by connecting the GitHub repository to a Vercel project and using its detected Next.js defaults. Do not configure `GROQ_API_KEY` in Vercel production; the live app's CSV summary works without AI, and the explanation action reports that AI is not configured. If a controlled local demo needs Groq, add the key only to the local `.env.local` file. Verified 22 October 2026: the free Hobby plan includes 100 GB of Fast Data Transfer and 10 GB of Fast Origin Transfer per month, with a 45-minute build-time limit per deployment, up to 100 deployments per day, and one concurrent deployment. Hobby is restricted to personal, non-commercial use; a public demo is suitable only while it remains non-commercial and is not used for the shop's business or anyone's financial gain. Because this project is based on a client shop, confirm with Vercel support if its use or hackathon circumstances make that unclear; commercial use requires Pro or Enterprise. Sources: [Hobby plan](https://vercel.com/docs/plans/hobby), [limits](https://vercel.com/docs/limits), and [fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage). Verify the production build and live URL after deployment, then open the live link on a phone and confirm the fictional sample data tells the complete sales story clearly. The demo recording is prepared separately during `6-ship`.
- **Submission:** The live link is optional and supplements—not replaces—the required short demo video and public GitHub repository. The Hobby plan limits are checked in the deployment note above; if the project needs commercial use, confirm current Pro pricing before upgrading.

## Look and Feel

Implements `prd.md > Screens and Layout` and `prd.md > Look and Feel`.

Use a navy (#1E3A5F) page with warm cream (#FAF8F5) text and muted blue-gray (#B8C4D6) secondary text. Use gold (#F2B84B) accents and gold buttons with navy text. Load Poppins for headings and DM Sans for body text through `next/font`, without an external stylesheet. Keep rounded cards and readable mobile-first sizing. On the summary view, put the month comparison in a translucent cream pill inside a lighter blue gradient hero (#2B5283 to #335F96); emphasize existing percentage and currency figures in gold. Use cream cards with charcoal (#292524) text, green (#2F7D5B), amber (#C77D12), and gold top bars, and darker card-specific amount colors for contrast. Add subtle background decoration and a pill-shaped reset button. On hover-capable devices with motion enabled, lift result cards slightly with a soft shadow; cards are not links. Preserve the header icon, BizzSimp wordmark, and “Your sales, made simple” tagline. Reduce or disable motion when requested. Keep the summary compact on laptop screens and readable at phone widths, with no charts, dense tables, or dashboard styling.

## Components

### Upload and summary page

`src/app/page.tsx` owns the current view and transient form/result state. It sends a selected file's text or the bundled sample text through the same parser and analysis flow, then chooses whether to show the upload view or summary view. It does not persist data.

PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### Upload view

`src/components/UploadView.tsx` shows the headline, explanation, CSV file input, “Try with sample data” action, required headers, date format, example row, and browser-only/no-storage note. It also shows friendly file and validation errors, including missing headers and insufficient data.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### CSV parsing and validation

`src/lib/parseSalesCsv.ts` accepts CSV text (never a browser `File`), uses Papa Parse to read the fixed headers, and validates each nonblank data row. It returns a typed empty-file, parse-error, missing-header, no-usable-row, or success result. Blank rows do not produce warnings. Any skipped rows are reported with spreadsheet row numbers, showing at most the first 10 followed by “and N more”; valid rows continue through analysis whenever at least one usable row remains, regardless of the skipped-row percentage. An empty file, parse failure, or no usable rows stays on the upload view with a friendly message.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > States and Boundaries`.

### Monthly sales analysis

`src/lib/analyzeSales.ts` receives validated rows and a reference date, chooses the latest two completed calendar months represented in the data, calculates row revenue as quantity times price, and computes the overall and per-item comparisons. It returns structured values rather than display sentences. Current-month rows are excluded from comparisons. A slowing item must have a revenue drop greater than 10% of its own previous-month revenue; qualifying items are ordered by the largest naira drop first.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`.

### Sentence writing

`src/lib/salesCopy.ts` receives analysis results and creates the plain-language opening summary, item-card text, and one suggestion. Use deterministic TypeScript templates—no AI call in this module. In the slowing card, name both compared months and use plain wording that distinguishes no latest-month sales from a lower but nonzero result; when no item passes the 10% item-drop threshold, explain that no item had a drop greater than 10% of its own previous-month revenue. For a nonzero previous-month total, use a steady opening sentence with no item name when the total change is within 10% of that total. Preserve the PRD's other rules: only name an item in an increasing opening summary when its revenue increase is at least one third of the total increase; use the 10% previous-month-revenue threshold for changed-item suggestions; use the top seller when the previous month's total is zero; and never infer stock or inventory.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`, `prd.md > Non-Goals`.

### Summary view

`src/components/SummaryView.tsx` renders the compared month names, opening sentence, optional note naming the unfinished current month, skipped-row notes, the three result cards, and the optional AI explanation action and response. The page sends only the compared month and item revenue aggregates when the seller clicks the action. The skipped-row note includes an icon, a count, and at most 10 row numbers followed by “and N more” when needed. Its return action asks the page to clear the current result and show the upload view.

PRD ref: `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`, `prd.md > Return to upload`, `prd.md > States and Boundaries`.

### Optional AI explanation

`src/lib/explanation.ts` selects the two compared month labels and revenue totals and at most 12 item names with their previous/latest month revenue totals. It omits transaction-level dates, units, and raw CSV rows. `src/app/api/explain/route.ts` validates and size-limits that payload, requires the server-only `GROQ_API_KEY`, and calls Groq's chat completions endpoint with a factual explanation prompt and bounded output. This feature is for local development and controlled demos only; never configure the key in production. If the provider is unavailable, rate-limited, or unconfigured, the route returns an explicit error and leaves the deterministic summary intact. Do not log the input payload or key.

PRD ref: `prd.md > Optional AI explanation`, `prd.md > Privacy and persistence`.

### Sample data

`src/lib/sampleCsv.ts` generates clearly fictional CSV text when “Try with sample data” is clicked. It derives dates from the browser's current date: representative rows in the two previous complete calendar months, plus a row on today in the current month. The current-month row ensures the unfinished-month note appears without introducing future-dated sample transactions. Keep Ankara dress as the clear biggest mover, show three latest-month sellers, and include both a full drop (Silk scarf: ₦40,000 to ₦0) and a partial drop (Belts: ₦30,000 to ₦12,000). The generated text goes through the same parser and analysis functions as an uploaded CSV.

PRD ref: `prd.md > The Core Journey`, `prd.md > CSV upload and validation`, `prd.md > Product Decisions`.

### Focused unit tests

`src/lib/parseSalesCsv.test.ts` tests missing headers, invalid dates and values, skipped-row numbers, blank rows, empty input, malformed CSV, and normalized headers. `src/lib/analyzeSales.test.ts` tests choosing the latest two completed months, excluding the current month, insufficient data, zero-revenue cases, the 10% total-revenue steady headline boundary, the one-third opening-summary rule, next-step choice and tie-breaking, and per-item slowdown filtering/order above 10%. `src/lib/explanation.test.ts` checks that the request contains only bounded monthly/item revenue aggregates. `src/app/api/explain/route.test.ts` checks missing configuration, invalid input, provider request contents, and rate-limit handling. Run all tests with `npm test`.

PRD ref: `prd.md > CSV upload and validation`, `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`.

## Data Model

All sales data and UI state live temporarily in browser memory:

- **Validated sale:** `date` as a validated calendar date, `item` as text, and nonnegative numeric `quantity` and `price`.
- **Parse result:** empty input, parse error, missing required headers, no usable rows, or usable sale rows plus skipped CSV row numbers.
- **Analysis result:** the previous and latest completed month identifiers/totals, overall revenue change, per-item revenue and unit totals, the ranked latest-month items, slowing items, and the values needed to choose a suggestion.
- **Explanation request:** two month labels and revenue totals, up to 12 item names with previous/latest month revenue totals, and the count of omitted items. No CSV rows, transaction dates, or units.
- **Page state:** upload or summary view, current message/warnings, current analysis result, and idle/loading/success/error state for the optional explanation.

The fictional sample CSV is generated as a string in the browser when requested. Selecting a file reads its text in the browser; it is not posted to Vercel or Groq. The parser and analysis functions return data to the page, which renders it. Only after the seller requests an explanation does the page send month labels and revenue totals plus up to 12 item names and their two monthly revenue totals to the server route and Groq. No transaction-level dates, units, or raw CSV rows are in that request. “Try another file” clears the current result and explanation; leaving, refreshing, or closing the page discards browser state. No local storage, cookies for sales data, database, or saved history is used.

## File Structure

The repository contains the application and the `devpost/` planning documents.

```text
BizzSimp/
├── src/
│   ├── app/
│   │   ├── globals.css              # Tailwind setup and page color/type styling
│   │   ├── icon.svg                 # Shared app icon and header logo
│   │   ├── layout.tsx               # Root HTML layout and global stylesheet
│   │   ├── page.tsx                 # Client page state and upload-to-summary flow
│   │   └── api/
│   │       └── explain/
│   │           ├── route.ts          # Validated server-side Groq explanation endpoint
│   │           └── route.test.ts     # Route validation and provider behavior tests
│   ├── components/
│   │   ├── UploadView.tsx           # Upload, sample action, instructions, messages
│   │   └── SummaryView.tsx          # Month comparison, cards, and optional explanation
│   └── lib/
│       ├── analyzeSales.ts          # Pure monthly and per-item calculations
│       ├── analyzeSales.test.ts     # Focused sales-analysis tests
│       ├── explanation.ts           # Aggregate-only explanation request builder
│       ├── explanation.test.ts      # Ensures the request omits raw sales details
│       ├── parseSalesCsv.ts         # CSV parsing and row/header validation
│       ├── parseSalesCsv.test.ts    # Focused parser/validation tests
│       ├── salesCopy.ts             # Deterministic user-facing sentence templates
│       └── sampleCsv.ts             # Generates current-date-relative fictional demo CSV
├── public/                          # Static app assets, if scaffolded
├── devpost/                         # Existing planning and submission documents
├── package.json                     # Dependencies and dev/build/test scripts
├── package-lock.json                # npm dependency lockfile
├── .env.example                     # Placeholder for the server-only Groq API key
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration, if generated
├── postcss.config.mjs               # Tailwind/PostCSS configuration, if generated
└── vitest.config.ts                 # Vitest configuration
```

## External Services and Dependencies

- [Next.js documentation](https://nextjs.org/docs) — App Router, client components, and Route Handlers.
- [React documentation](https://react.dev/learn) — page and component behavior.
- [TypeScript documentation](https://www.typescriptlang.org/docs/) — typed data and pure logic modules.
- [Tailwind CSS documentation](https://tailwindcss.com/docs) — styling. Use the version/configuration generated for the chosen Next.js setup.
- [Papa Parse documentation](https://www.papaparse.com/docs) — parse CSV text in the browser; no endpoint, account, key, or external request.
- [Groq API documentation](https://console.groq.com/docs/openai) — OpenAI-compatible chat completions for the optional explanation; uses the server-side `GROQ_API_KEY`. Only disclosed aggregates are sent on explicit request. Review [Groq data handling](https://console.groq.com/docs/your-data) and [rate limits](https://console.groq.com/docs/rate-limits).
- [Vitest documentation](https://vitest.dev/guide/) — run the two pure-module test files; no external service.
- [Vercel Next.js documentation](https://vercel.com/docs/frameworks/nextjs) — host the public demo. Vercel serves the app; the CSV is not uploaded to a Vercel function or stored there. The optional explanation Route Handler requires a server-only `GROQ_API_KEY` for local development or controlled demos; do not configure the key in production.

## Important Failure Modes

- **Missing required headers or unreadable CSV** → stay on the upload view and name the missing headers or explain that the file could not be read; do not render a misleading summary.
- **Some malformed rows** → skip only the unreadable rows, show their count and source row numbers, and continue with usable rows. Completely blank rows are ignored silently.
- **No usable rows, fewer than two completed months, or both compared months have zero revenue** → stay on the upload view with the specific friendly explanation required by the PRD.
- **File read or parse exception** → show a clear upload error and allow another file to be selected; do not silently fall back to a successful-looking result.
- **AI key missing, provider error, timeout, or rate limit** → show a clear explanation-specific error and retry option; keep the deterministic summary and calculated figures available.

## What Was Simplified and Why

- **Browser memory instead of accounts, a database, or saved reports** — the proof of concept is one upload-and-summary flow and must not retain customer data. A later product could add persistence only with an explicit privacy and product decision.
- **Fixed CSV headers and date format instead of column matching** — keeps validation understandable and the six-day build focused.
- **Deterministic calculations and suggestions, with AI limited to an optional explanation** — numeric results remain explainable and testable. Only selected aggregates are sent to Groq on request; the raw CSV stays in the browser.
- **No charts, dashboards, inventory data, or stockout advice** — these do not prove the unique kernel and sales alone cannot support inventory claims.
- **Fictional bundled sample data instead of real customer data** — supports a complete demo while protecting the client.

## Decisions and Open Issues

- **Learner choice — Next.js App Router, TypeScript, and Tailwind CSS:** use tools the learner already knows, enabling them to review generated code. The tradeoff is a little framework structure beyond a plain static page.
- **Learner choice — client-side CSV processing with Papa Parse:** the raw CSV is never uploaded or saved by BizzSimp.
- **Learner choice — optional Groq explanation, added after the original no-AI scope:** the AI call is server-side, opt-in, and limited to the compared month and item revenue aggregates. The raw CSV and transaction-level dates are excluded. It is for local development and controlled demos only; do not configure the key in production.
- **Learner choice — Vercel deployment:** provide a live demo link in addition to the required public GitHub repository and short video. The Groq key is not configured in the production deployment.
- **Learner choice — focused Vitest tests:** test parsing/validation, sales analysis, and explanation request/route contracts.
- **Resolved uncertainty — AI-generated wording versus code-generated insights:** calculations, the headline, cards, and suggestion remain deterministic code. Groq is used only for the optional natural-language explanation, based on explicitly disclosed aggregates.
- **Resolved product-rule clarification — unreadable-row threshold:** the PRD's approved behavior remains authoritative. Skip unreadable rows and continue whenever usable rows remain; show row numbers. Do not reject a file based on the percentage of unreadable rows.
- **Implementation detail — module boundaries:** keep CSV parsing/validation, analysis, and user-facing sentence templates in separate TypeScript files so each is reviewable and the first two can be tested without the UI.
- **Verified 22 October 2026:** the current Vercel Hobby allowances and non-commercial-use restriction are recorded under `Where It Runs and How Someone Tries It > Deployment`, with links to the official plan, limits, and fair-use documentation. For this non-commercial proof-of-concept demo, Hobby is a reasonable option only if the client shop does not use it operationally and the deployment is not for anyone's financial gain; ask Vercel support if the client or hackathon context makes that uncertain.
- **No other product questions are blocking:** `prd.md > Open Questions` says none are blocking.
