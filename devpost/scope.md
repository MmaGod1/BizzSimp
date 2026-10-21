---
doc: scope
status: approved
---

# BizzSimp

BizzSimp turns a small online seller's sales CSV into a brief, plain-language account of what is selling, what is slowing down, and what they might do next.

## The Unique Kernel

Instead of asking sellers to interpret charts or KPIs, BizzSimp translates comparisons grounded in their sales data into clear sentences and one practical suggestion. The numbers and recommendations must be explainable from the uploaded data; the app must not claim to know inventory or stockouts.

## Who It's For

Small online sellers who aren't technical and find charts, reports, and sales KPIs confusing. The idea comes from a clothing-and-accessories store client whose sales data went unused because it was difficult to interpret.

## The Core Loop

A seller uploads a sales CSV. BizzSimp compares at least two monthly periods and presents a short account of the latest period, so the seller can quickly decide what to feature or investigate.

## Inspiration & Identity

A calm, clear, jargon-free experience that feels more like a helpful explanation than a dashboard. No charts.

## Why This Matters to the Learner

The learner wants sellers like their client to be able to use their sales data, and wants to learn a structured, reviewable way to work with a coding agent from scoping through shipping.

## What "Working" Looks Like

In a short demo, a seller uploads a realistic sample CSV with at least two complete calendar months and receives a one-sentence monthly summary, the top two or three items, items selling less than in the prior month or not recently, and one clear data-backed suggestion. “Not selling recently” means an item sold in the previous month but had no sales in the latest month. In under a minute, the seller can understand a sales trend and a practical next step. If the uploaded data does not contain two complete calendar months to compare, the app explains that it needs more data instead of giving a misleading summary.

## The POC Boundary

- One browser-based CSV upload-and-summary flow; process the file in the browser without storing it.
- Use a simple CSV format with `date`, `item`, `quantity`, and `price` headers, dates in `YYYY-MM-DD` format, and a displayed example row. For an unsupported file, identify missing required headers in a friendly message.
- Compare sales and revenue across the latest two complete calendar months using ordinary code, then produce plain-language text from a separate sentence-writing step. An item is “not selling recently” if it had sales in the previous month and none in the latest month. Keep AI out of this proof of concept; the separate wording step leaves room to explore AI later.
- Use a made-up sample CSV containing at least two complete calendar months for the demo and video; show no real customer data.
- Use no charts, dashboards, inventory claims, or stockout advice.

## Later

- Column matching or broader support for store-specific CSV headers and date formats.
- Inventory data and inventory-aware recommendations.
- Explore AI-generated wording if templates prove too rigid.

## Explicitly Cut

- AI-generated analysis or wording in this proof of concept: code-based comparisons are free to run, easier to explain, and keep statements grounded in the data.
- Charts and KPI dashboards: the core value is a brief explanation, not another report to interpret.
- Inventory and stockout claims: sales data alone cannot establish stock levels or whether an item sold out.
- Real customer data in the demo video: made-up sample data demonstrates the flow without exposing customer information.
