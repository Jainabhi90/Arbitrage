# ArbDetector

ArbDetector is a full-stack arbitrage scanner for prediction markets. It continuously scans Kalshi and Polymarket, matches equivalent markets across both platforms, and surfaces fee-adjusted arbitrage opportunities in near real time.

## Live Site

- Landing page: https://arbitrage-xi-nine.vercel.app/
- Dashboard: https://arbitrage-xi-nine.vercel.app/dashboard.html

## What This Project Does

- Fetches live market data from Kalshi and Polymarket.
- Normalizes both platform schemas into one shared internal format.
- Matches equivalent events using fuzzy and token-based scoring.
- Detects arbitrage in both directions:
	- YES(A) + NO(B)
	- NO(A) + YES(B)
- Adjusts for platform fees before marking any opportunity as profitable.
- Exposes a dashboard with:
	- Live opportunities
	- Near-miss opportunities
	- "Ready this week" candidates (<= 7 days)
	- Scan history and profit calculator

## Code Overview

### Frontend

- `index.html` + `main.js` + `styles.css`
	- Product landing page
	- Interactive arbitrage math calculator
	- Waitlist section and live teaser cards

- `dashboard.html` + `dashboard.js`
	- Live arbitrage dashboard
	- Auto-refresh scan UI
	- Near-miss and weekly candidates panels
	- Mock fallback UI when API is offline

### Backend Scanner and API

- `src/abhi/mockServer.js`
	- Main HTTP server
	- Periodic market scan loop
	- API endpoints (`/opportunities`, `/health`, `/register-order`)
	- Static file serving for frontend pages

- `src/abhi/first.js`
	- Kalshi fetch + topic filtering + event ranking + dedup

- `src/abhi/second.js`
	- Polymarket fetch + topic filtering

- `src/abhi/converter.js`
	- Converts raw provider payloads to a common internal market schema

- `src/abhi/eventMatcher.js`
	- Cross-platform event pairing using Fuse.js + weighted token similarity

- `src/abhi/detectArb.js`
	- Core arbitrage detection logic with fee adjustment

- `src/abhi/orderRouter.js`
	- Pluggable order registration layer with environment-based endpoint routing

### Test and Utility Scripts

- `src/abhi/liveTest.js`: runs a live fetch + match + detect flow in terminal
- `src/abhi/test.js`: runs detection with mock price data
- `src/abhi/mockPrices.js`: local sample prices for quick testing

### Telegram Integration (Alert Foundation)

- `src/abhi/telegram/App.js`: Telegram webhook receiver
- `src/abhi/telegram/adding.js`: chat subscription state
- `src/abhi/telegram/sending.js`: broadcast message sender to active subscribers

## High-Level Data Flow

1. Fetch markets from Kalshi and Polymarket
2. Normalize data into a shared shape
3. Match equivalent markets across platforms
4. Run arbitrage checks in both price directions
5. Save latest opportunities + near misses + weekly candidates
6. Serve results through `/opportunities`
7. Dashboard polls API and updates every few seconds

## API Endpoints

- `GET /opportunities`
	- Returns live opportunities, near misses, weekly candidates, scan stats
- `GET /health`
	- Returns basic server health and last scan details
- `POST /register-order`
	- Accepts order payload and forwards to platform-specific handler

## Local Development

### Requirements

- Node.js 18+

### Install

```bash
npm install
```

### Run

```bash
node src/abhi/mockServer.js
```

Open:

- http://localhost:3000/
- http://localhost:3000/dashboard.html

## Environment Variables

Common variables used by the scanner:

- `PORT` (default: `3000`)
- `ARBITRAGE_TOPIC` (default: `election`)
- `SCAN_INTERVAL_MS` (default: `5000`)
- `KALSHI_FEE` (default: `0.02`)
- `POLYMARKET_FEE` (default: `0.03`)
- `KALSHI_BASE_URL`
- `POLY_BASE_URL`

Order routing variables:

- `KALSHI_ORDER_API_URL`, `KALSHI_ORDER_API_KEY`, `KALSHI_ORDER_API_SECRET`
- `POLYMARKET_ORDER_API_URL`, `POLYMARKET_ORDER_API_KEY`, `POLYMARKET_ORDER_API_SECRET`

Telegram variables:

- `TELEGRAM_BOT_TOKEN`

## Notes

- If external APIs are unavailable, the dashboard falls back to sample data for demo continuity.
- Matching and arbitrage decisions are topic-dependent (`ARBITRAGE_TOPIC`).
- This project is intended for educational/prototyping use; evaluate execution, latency, and risk controls before production trading.
