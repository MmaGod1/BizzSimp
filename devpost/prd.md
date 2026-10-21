---
doc: prd
status: approved
---

# BizzSimp — Product Requirements

BizzSimp turns a small online seller's CSV into a short, plain-language sales summary and a data-backed suggestion.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey

1. The seller opens BizzSimp and sees a plain-language introduction, a CSV upload area, the required file format with an example row, and a note that the file is processed in the browser and not saved.
2. The seller uploads a CSV or chooses “Try with sample data.” BizzSimp reads it immediately; there is no separate analyze button or waiting screen.
3. If the file can be summarized, the upload view is replaced on the same page by a summary of the two most recent completed calendar months represented in the usable data. Month names appear above the summary. If the current month is present, it is excluded and a note explains that it is unfinished.
4. The seller reads the overall revenue comparison, the three short result cards, and a suggestion based on the monthly figures. They can choose “Try another file” to return to the upload view.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.

## Screens and Layout

BizzSimp is a single-page experience with two views, not a multi-page flow:

- **Upload view:** Calm, mostly empty layout with the headline “Turn your sales into simple advice.”, a one-line explanation, one clear upload area, and a “Try with sample data” button. Below these, show the required headers (`date`, `item`, `quantity`, `price`), the required `YYYY-MM-DD` date format, one example row, and a short browser-processing/no-storage note.
- **Summary view:** Replace the upload view on the same page. Show the compared months at the top, then the overall one-sentence summary, followed by cards for “What’s selling,” “What’s slowing down,” and “What to do next.” Put “Try another file” at the bottom.

Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.

## Look and Feel

Calm and friendly, like a helpful explanation rather than a dashboard. Use a navy (#1E3A5F) page background with warm cream (#FAF8F5) text and muted blue-gray (#B8C4D6) secondary text. Use gold (#F2B84B) accents and buttons with navy button text; the results hero uses a lighter blue gradient (#2B5283 to #335F96). Use cream result cards with charcoal (#292524) text, green (#2F7D5B), amber (#C77D12), and gold top bars, plus darker matching shades for emphasized amounts. Use Poppins for headings and DM Sans for body text, loaded through `next/font` without an external stylesheet. Show the BizzSimp icon beside its wordmark and the tagline “Your sales, made simple.” On the results view, place the month comparison and summary in the gradient hero, with a pill for the months and gold emphasis on key figures. Add subtle background decoration, keep text high-contrast, and use a rounded button. On devices that support hover, gently lift the result cards with a soft shadow; do not imply they are clickable, and respect reduced-motion preferences. Keep the layout compact on laptop screens and readable on phones. Avoid charts and dense tables.

## Features and Behavior

### CSV upload and validation

The seller can upload a CSV in the displayed format or load the made-up sample data. Process the file in the browser; do not save it. Read the required `date`, `item`, `quantity`, and `price` headers, with dates formatted as `YYYY-MM-DD`.

- If required headers are missing, remain on the upload view and identify the missing header names, while showing the expected headers again.
- Ignore completely blank rows without a warning.
- Skip rows with an invalid date, or with a missing, non-numeric, or negative quantity or price. If any rows are skipped, show a short note above the summary with the count and row numbers.
- If no usable rows remain, stay on the upload view and explain that there is not enough usable sales data.
- If the usable data does not contain at least two completed calendar months to compare, stay on the upload view and explain that at least two full months of sales data are needed.
- If the current calendar month is present, exclude it from comparisons and name it in the note, for example: “October 2026 isn’t finished yet, so it wasn’t included.”

Source: `scope.md > The POC Boundary`, `scope.md > What "Working" Looks Like`.

### Monthly summary

Compare the two most recent completed calendar months represented in usable data. Show their names at the top. For each valid row, revenue is quantity multiplied by price; sum row revenue across the month and show amounts in naira.

- Lead with one plain-language sentence comparing total revenue in the latest month with the previous month.
- When the previous month had revenue and total revenue increased, state the percentage change. Name the item with the largest revenue increase only if its increase accounts for at least one third of the shop's total increase; otherwise, do not attribute the change to an item.
- When total revenue decreased or stayed flat, state the change without naming an item.
- When the previous month's total revenue is zero, state the latest month's earnings and explain that there is no percentage change to show.
- If both months have zero revenue, do not show a summary; remain on the upload view and explain that there is not enough sales data to summarize.

Source: `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.

### Result cards and suggestion

Show up to three items in “What’s selling,” ranked by latest-month revenue. Show each item's name, revenue, and units sold, for example: “Ankara dress: ₦180,000 from 6 units.”

“What’s slowing down” shows items whose revenue decreased from the previous month, including items that had no sales in the latest month, ordered by the size of the naira revenue drop, largest first. Name both months in each comparison and say plainly when an item had no sales, for example: “Silk scarf: ₦40,000 in August, no sales in September.” For a lower but nonzero result, show the revenue for both named months. If there are no slowing items, say so. When the previous month had zero total revenue, explain that there is nothing to compare against.

Show one suggestion in “What to do next.” Find the item with the largest absolute naira revenue change between the two months. If its revenue increased, suggest featuring it more; if it decreased or reached zero, suggest looking into it (for example, a discount or a fresh photo). If items tie for the largest change, choose the one with higher latest-month revenue. Never mention inventory or stock. State the figures behind the suggestion.

Only make that changed-item suggestion if an item's change is greater than 10% of the previous month's total revenue. If no item passes that threshold, say sales look steady and suggest continuing to feature the top seller. If the previous month's total revenue is zero, use the latest month's top seller suggestion instead of the threshold.

Source: `scope.md > The Unique Kernel`, `scope.md > What "Working" Looks Like`, `scope.md > The POC Boundary`.

### Return to upload

“Try another file” returns to the upload view so the seller can start again.

Source: `scope.md > The Core Loop`.

## States and Boundaries

- **First visit:** Show the upload view and CSV instructions; no account or setup is required.
- **Successful analysis:** Show the summary view on the same page, including compared months, the overall summary, all three cards, and any row-skipping note.
- **Missing headers:** Stay on the upload view, list the missing names, and repeat the expected format.
- **Unreadable rows:** Skip invalid rows and report their count and row numbers. Ignore entirely blank rows without reporting them.
- **Not enough usable data:** Stay on the upload view with a friendly explanation when no usable rows remain, fewer than two completed months are available, or both compared months have zero revenue.
- **Current month present:** Exclude the unfinished month and explain this on the summary.
- **Privacy and persistence:** The uploaded file is processed in the browser and is not saved. The summary is available for the current page flow; no account or saved history is part of the product.
- **No inventory knowledge:** Never infer stock levels, stockouts, or inventory availability from sales data.

Source: `scope.md > The POC Boundary`, `scope.md > Explicitly Cut`.

## Product Decisions

- Keep one simple CSV upload-and-summary flow for the six-day project; no sign-up, menus, charts, or dashboard.
- Use a fixed CSV format with `date`, `item`, `quantity`, and `price` headers and `YYYY-MM-DD` dates. Show an example row; do not add downloads or column matching.
- Process the file in the browser without saving it.
- Use a made-up sample CSV with dates generated relative to the current date. Show three latest-month sellers, a full drop and a partial drop, and keep Ankara dress as the clear biggest mover; do not show real customer data.
- Use ordinary code for comparisons and suggestions, with sentence writing kept separate so AI wording could be explored later. AI is out of this proof of concept because code-based results are free to run, easier to explain, and less likely to misstate numbers.
- Use revenue as the main measure; calculate each row's revenue as quantity multiplied by price, and display amounts in naira. Show units as a supporting detail.
- In an opening summary for an increase, name the item with the largest revenue increase only when it accounts for at least one third of the overall increase. Do not name an item in a flat or decreasing summary.
- Define “not selling recently” as an item that earned revenue in the previous month and none in the latest month. Never make inventory claims.
- Compare only the two most recent completed calendar months represented in the usable data; omit the current month.
- Skip malformed or negative-value rows with a visible count and row numbers; ignore completely blank rows.
- Use the learner's calm, friendly visual direction in `Look and Feel`.

Source: `scope.md > The POC Boundary`, `scope.md > Later`, `scope.md > Explicitly Cut`.

## What We're Building

- One responsive page with an upload view and a summary view.
- CSV instructions with the four required headers, date format, and an example row.
- Sample-data action using made-up sales data.
- Browser-only processing and clear statements about not saving the file.
- CSV validation and friendly missing-header, insufficient-data, and skipped-row feedback.
- Revenue comparisons across the two most recent completed months, a one-sentence opening summary, up to three top revenue items with units, slowing/no-revenue items, and one data-backed next-step suggestion.
- An option to return from the summary to the upload view.

## Deferred From the POC

- Flexible header matching and alternate date formats: keep the upload predictable and the proof of concept small.
- Inventory-aware recommendations: sales rows do not show stock levels.
- Real customer data in the demo: use made-up data instead.

## Possible Later Enhancements

Broader support for store-specific CSV formats or column matching. Inventory-aware advice, if sellers can provide trustworthy stock data. AI-generated wording if the separate sentence-writing step's templates prove too rigid.

## Non-Goals

- AI-generated analysis or wording: code-based analysis is free to run, explainable, and grounded in the uploaded figures.
- Charts, dense tables, or KPI dashboards: the product's purpose is to explain the figures plainly.
- Accounts, saved reports, or stored uploads: the demo is one browser-only flow.
- Stockout or inventory claims: these cannot be established from the sales CSV.
- Showing real customer data in the demo video: sample data protects the client's information.

## Open Questions

None blocking the product definition. Technical choices about CSV parsing and the exact implementation of the separate sentence-writing step belong in `4-spec`.
