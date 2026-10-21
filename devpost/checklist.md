---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [ ] **1. Upload a CSV and get a plain-language sales story**
  Becomes usable: A running single-page app where a seller can upload the required CSV or try fictional sample data and see a clear comparison of the two latest completed months, top sellers, slowing items, and a data-backed suggestion.
  Why now: This puts the unique kernel—the explainable, data-grounded monthly story—into the learner's hands early. Scaffolding is part of this working path, not a separate setup step.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Monthly summary`, `prd.md > Result cards and suggestion`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Look and Feel`, `spec.md > Components > Upload and summary page`, `spec.md > Components > Monthly sales analysis`, `spec.md > Components > Sentence writing`, `spec.md > Components > Summary view`, `spec.md > Components > Sample data`, `spec.md > File Structure`
  Build: Scaffold the Next.js App Router, TypeScript, and Tailwind app; add the client-side upload/sample-to-summary flow, CSV parsing and core monthly analysis, deterministic plain-language copy, sample data, and focused tests for the successful path. Apply the specified calm, readable visual direction from the start.
  Verify (mechanical): Run `npm test` and `npm run build`; both must pass.
  Learner check: Run the app, choose “Try with sample data,” and check that the compared months, headline, three result cards, and suggestion make sense. Share what feels clear or confusing while the remaining work can still respond to your feedback.
  Commit: `Build CSV-to-sales-summary journey` (before the first GitHub push, show the exact staged-file list and wait for learner confirmation; then push this commit to the configured remote)

- [ ] **2. Explain messy data and make it easy to try again**
  Becomes usable: Sellers get clear, truthful feedback for missing headers, unreadable rows, insufficient data, and unfinished current-month data, and can return from results to start over; the layout remains readable on a phone.
  Why now: With the main kernel working, this closes the important failure and recovery paths and lets early feedback shape the final experience without delaying a usable demo.
  PRD ref: `prd.md > CSV upload and validation`, `prd.md > States and Boundaries`, `prd.md > Return to upload`
  Spec ref: `spec.md > Components > Upload view`, `spec.md > Components > CSV parsing and validation`, `spec.md > Components > Focused unit tests`, `spec.md > Important Failure Modes`, `spec.md > Look and Feel`
  Build: Complete validation and friendly upload errors, skipped-row counts and source row numbers, current-month and insufficient-data notes, and the reset-to-upload action. Make slowing-item text name both compared months and plainly distinguish no sales from lower nonzero revenue. Extend focused parser, analysis, and copy tests for these cases, then refine the responsive layout and accessible labels/states to match the approved visual direction.
  Verify (mechanical): Run `npm test` and `npm run build`; both must pass, including the added boundary-case tests.
  Learner check: Try a CSV with a missing header and one with too little usable data, then return from a successful summary to the upload view. Check that the explanations tell you what to do next.
  Commit: `Handle CSV errors and recovery`

- [ ] **3. Put the demo live and check its story**
  Becomes usable: The deployed app opens on a phone, and its fictional sample data clearly demonstrates the monthly comparison, a top seller, an item that stopped selling recently, and a grounded next step.
  Why now: Deployment and sample-data polish belong after the local app and its recovery paths work, so the live demo showcases the finished proof of concept rather than a moving target.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Result cards and suggestion`, `prd.md > Product Decisions`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components > Sample data`, `spec.md > Decisions and Open Issues`
  Build: Check current Vercel plan limits, deploy the app to Vercel, and refine the fictional sample to show three latest-month sellers, an item with no latest-month sales, and an item whose revenue declines but remains nonzero; keep one largest mover clear for the headline and suggestion. Polish only what is needed to make the complete story clear for the later demo recording. Keep real customer data out of the demo.
  Verify (mechanical): Run `npm test` and `npm run build`; both must pass. Confirm Vercel reports a ready deployment and that the live URL loads the app.
  Learner check: Open the live link on a phone, try the sample data, and check whether the complete story is clear enough to show on camera. Share any final confusion or polish requests.
  Commit: `Prepare the live BizzSimp demo`

## Hands-on Checkpoints

- [x] Early usable behavior explored — sample flow tried; learner confirmed the numbers and structure work and requested clearer named-month wording for slice 2 and a richer fictional sample for slice 3
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions
