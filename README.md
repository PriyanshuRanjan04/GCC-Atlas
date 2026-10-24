# GCC Atlas

**A single source of truth for India's Global Capability Centre (GCC) ecosystem.**

GCC Atlas helps companies decide *where* to set up a Global Capability Centre in India. It aggregates what is publicly known about existing GCCs, city talent markets, office real estate, and state incentive policies — labelling every figure with its confidence level and source link, and being explicit about what is not disclosed. No hallucinated headcounts. No stale estimates presented as facts.

---

## The Problem

Decisions about where to build a GCC in India are driven by referrals, anecdote, and scattered consultant PDFs. There is no single, transparent, sourced dataset that a decision-maker can interrogate directly.

GCC Atlas is that dataset, wrapped in a research-grade UI.

---

## Features

| Feature | Status |
|---|---|
| **GCC Directory** — 68+ captive GCC profiles across 7 cities, searchable and filterable by industry, parent country, city, entity type, and confidence level. Every record links to its sources. | ✅ Live |
| **City Explorer** — Interactive Leaflet map with city bubbles sized by any of four layers (captive count, rent, salary, ecosystem maturity). Side-by-side comparison of up to 3 cities: salary ranges, rent, incentives, clusters — all with confidence badges and `as_of` dates. Three Recharts charts. | ✅ Live |
| **Methodology** — Transparent explanation of data collection, confidence levels, entity type taxonomy, and what the dataset does and does not cover. | ✅ Live |
| **Setup Advisor** — Answer questions about your GCC's function, headcount, and priorities; receive a scored city shortlist with an AI-generated explanation. | 🔧 In progress |
| **Ask Atlas** — Grounded conversational chat over the dataset, powered by the Groq API. | 🔧 In progress |

---

## Data Principles

1. **Every record is sourced.** Each GCC profile and city data point carries one or more `source_urls` linking to the page where the figure was found.
2. **Confidence is explicit.** Every record carries a `confidence` field: `verified` (confirmed on an official page), `reported` (from news or secondary sources), or `estimated` (inferred or calculated). The UI shows a colour-coded badge on everything.
3. **Nulls are honest.** If a value — headcount, year established, location detail — was not found in public sources, it is stored as `null` and displayed as **Not disclosed**. We do not fill gaps with guesses.
4. **Entity types are distinct.** Only `captive_gcc` records are counted as GCCs in statistics. Professional services delivery centres, regulated IFSC entities, and service providers are tracked separately and labelled accordingly.
5. **Salary and rent figures are estimates.** They are sourced from public reports and consultant surveys. Treat ranges as directional, not contractual.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4, custom design system |
| UI components | shadcn/ui |
| Charts | Recharts |
| Map | Leaflet (CartoDB Dark Matter tiles) |
| Data | Static JSON files in `/data`, loaded at build time — no database |
| AI (upcoming) | Groq API (`llama-3.3-70b-versatile`) |
| Deployment | Vercel |

---

## Project Structure

```
gcc-atlas/
├── data/                        # Frozen static dataset (do not edit in dev)
│   ├── gccs.json                # 86 entity records (68 captive + 18 ecosystem)
│   ├── cities.json              # 7 city profiles: talent, rent, clusters
│   └── incentives.json          # State incentive policy records
│
├── lib/
│   ├── types.ts                 # TypeScript interfaces for all data models
│   ├── data.ts                  # Data loaders and helper functions
│   └── geo.ts                   # City and micro-market coordinates (never in /data)
│
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout: Navbar, Footer, fonts
│   ├── page.tsx                 # Home / landing page
│   ├── globals.css              # Tailwind v4 @theme tokens + component classes
│   ├── directory/
│   │   ├── page.tsx             # GCC Directory (search, filter, URL state)
│   │   └── [id]/page.tsx        # GCC detail page (static params)
│   ├── cities/
│   │   └── page.tsx             # City Explorer (server shell → CitiesClient)
│   ├── methodology/
│   │   └── page.tsx             # Methodology & data transparency page
│   ├── advisor/
│   │   └── page.tsx             # Setup Advisor (placeholder, in progress)
│   └── chat/
│       └── page.tsx             # Ask Atlas (placeholder, in progress)
│
└── components/
    ├── layout/
    │   ├── Navbar.tsx
    │   └── Footer.tsx
    ├── ui/
    │   ├── ConfidenceBadge.tsx  # Colour-coded badge with ⓘ tooltip
    │   ├── EntityTypeBadge.tsx  # Captive / ecosystem entity type pill
    │   ├── NullableValue.tsx    # Renders null as "Not disclosed"
    │   └── SourceLinks.tsx      # Linked source URL list
    ├── directory/
    │   └── DirectoryClient.tsx  # Client-side search + filter (URL state)
    └── cities/
        ├── CitiesClient.tsx     # Main City Explorer coordinator
        ├── CityMapLeaflet.tsx   # Leaflet map (dynamic, ssr: false)
        ├── CityPanel.tsx        # City side panel / mobile bottom section
        ├── CityComparison.tsx   # 3-city comparison table
        └── CityCharts.tsx       # Recharts: GCC count, rent vs salary, ecosystem
```

---

## Setup

### Prerequisites

- Node.js 20+
- A [Groq API key](https://console.groq.com) (required only for the AI features; the rest of the app runs without it)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/<your-handle>/gcc-atlas.git
cd gcc-atlas

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Open .env.local and add your Groq key:
# GROQ_API_KEY=gsk_...

# 4. Start the dev server
npm run dev

# 5. Open the app
# http://localhost:3000
```

> The AI features (Setup Advisor, Ask Atlas) will gracefully degrade if `GROQ_API_KEY` is absent — they show a "not yet available" placeholder.

---

## Status

This is a **prototype under active development**. The dataset is a seed — it covers publicly reported information and is not exhaustive. Figures should not be used for investment decisions.

See the [Methodology page](http://localhost:3000/methodology) for a full explanation of data sources, confidence levels, and known gaps.

---

## Licence

Private — prototype only. Not for redistribution.
