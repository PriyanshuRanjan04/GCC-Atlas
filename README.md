# GCC Atlas

> **A single source of truth for India's Global Capability Centre (GCC) ecosystem.**

GCC Atlas helps companies deciding to set up a GCC in India answer two questions with evidence instead of referrals: *Where should we set up?* and *Who is already here and who can we trust?* Every data point is sourced, confidence is always visible, and the AI never fabricates — it explains deterministic results using only verified data.

---

## The Problem

India has 2,000+ GCCs, but the ecosystem is deeply fragmented. Reports disagree on how many exist, no verified public list of which companies operate them is available, and city-level data on incentives, office costs, and talent is scattered across government filings, press releases, consultant reports, and informal networks. New entrants rely on referrals, and service providers who deliver well lose to those who market well.

---

## Planned Features

| Feature | Description |
|---|---|
| **GCC Directory** | Search and filter 100 + verified GCC records by city, state, industry, parent country, headcount, and year established. Each record links to its primary source. |
| **City Explorer** | Interactive map of GCC density across India. Side-by-side city comparison: talent pool, salary ranges, office rent, incentives, and clusters. |
| **Setup Advisor** | Form-based input (industry, headcount, budget, timeline, priorities) → deterministic weighted scoring of cities → Groq-streamed explanation citing comparable GCCs and relevant state incentives, with a full score breakdown. |
| **Ask Atlas** | Grounded chat panel. Answers questions only from the dataset (e.g. "Which BFSI GCCs are in Pune?"). Shows sources inline. Replies "I don't have data on that" when the answer isn't in the data. |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui + Framer Motion |
| Charts | Recharts |
| Map | MapLibre GL / Leaflet |
| Data | Static JSON files bundled with the app |
| AI | Groq API (Llama family, streamed, server-side only) |
| Hosting | Vercel |

---

## Data Principles

- **Every record has at least one `source_url`.** No source → no row.
- **Confidence is explicit.** Each record is tagged `verified`, `reported`, or `estimated`.
- **Unknown values are `null`, never guessed.** Costs and talent figures are ranges with an `as_of` date.
- **Scoring is deterministic.** The AI explains results; it does not decide them.

---

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/gcc-atlas.git
cd gcc-atlas

# 2. Install dependencies
npm install

# 3. Add your Groq API key
cp .env.example .env.local
# Open .env.local and replace the placeholder with your actual key

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** The app degrades gracefully if the Groq API is unavailable — the Setup Advisor will show deterministic scoring results with a template-based explanation rather than failing silently.

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq API key. Never expose this to the client. |

See `.env.example` for the full list of required variables.

---

## Project Status

🚧 **Under active development.** The project is currently in the initial build phase. Features are being added incrementally and the dataset is being researched and verified. Not ready for production use.

### Build Phases

- [x] Repository setup
- [ ] Research & dataset (JSON files with sources and confidence)
- [ ] Project scaffold, design system, landing page
- [ ] GCC Directory
- [ ] City Explorer (map and comparison)
- [ ] Setup Advisor (scoring + Groq explanation)
- [ ] Ask Atlas chat
- [ ] Polish, QA, deploy to Vercel

---

## Roadmap (not in current scope)

- Service provider credibility layer and lead intelligence
- "GCCs coming next" signals from filings and news
- Live data pipelines
- Paid access for providers and advisors

---

## License

MIT
