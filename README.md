# COM Buyer Prospector

A focused tool for identifying potential .com upgrade buyers by analyzing alternate-TLD registrations across 35+ extensions.

## What it does

For each target `.com` domain, the tool checks whether the same brand name is registered under other TLDs (`.net`, `.io`, `.co`, etc.) and whether those domains are actively used by a real business — the strongest signal that someone may pay to upgrade to the `.com`.

### Per domain/TLD combination

- **Registration status** via RDAP (REGISTERED / NOT_REGISTERED / UNKNOWN)
- **DNS records** (A, AAAA, CNAME, MX, NS)
- **Website reachability** (HTTP/HTTPS, status code, redirects)
- **Page title & meta description**
- **Classification** (ACTIVE_BUSINESS, ACTIVE_WEBSITE, PARKED, FOR_SALE, etc.)
- **Contact discovery** (email, phone, contact page, LinkedIn)
- **Buyer opportunity score** (0–100)

## Quick start

```bash
npm run install:all
npm run dev
```

- **API**: http://localhost:3001
- **UI**: http://localhost:5173

Click **Run Scan** to analyze all 10 seed domains. Results appear in the dashboard and **Best .com Buyers** view.

## Expanding TLD coverage

Edit `server/src/config/tlds.ts` — add entries to the `TLD_LIST` array. No other code changes required.

## Export

Use the **Export CSV** button or `GET /api/export/csv` for a full results download.

## Tech stack

- **Backend**: Node.js, Express, SQLite, RDAP, DNS, HTTP probing
- **Frontend**: React, Vite, React Router
