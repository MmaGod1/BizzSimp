# BizzSimp

## What it is

BizzSimp turns a sales CSV into a plain-language comparison of recent monthly sales and one practical suggestion. It is for small online sellers who want an easy way to understand their sales data without charts or jargon, with an optional AI explanation of the calculated comparison.

## Run it

```sh
npm install
npm run dev
npm test
```

To try the optional AI explanation during local development, copy `.env.example` to `.env.local` and add your Groq API key. Do not configure the key in the public production deployment; the CSV summary works without AI. Never expose or commit the key.

## CSV format

Use a CSV with these headers and dates in `YYYY-MM-DD` format:

```csv
date,item,quantity,price
2026-05-14,Ankara dress,2,30000
```

The uploaded CSV is read in your browser and is not uploaded or stored by BizzSimp. If you request an AI explanation during local development, BizzSimp sends only the compared monthly totals and up to 12 item names with their monthly revenue totals to Groq; it does not send the CSV or transaction-level dates.

**Live demo:** [bizz-simp.vercel.app](https://bizz-simp.vercel.app/)
