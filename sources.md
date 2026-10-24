# GCC Atlas — Sources Master List

> Generated: 2026-10-24  
> Covers: `data/gccs.json`, `data/cities.json`, `data/incentives.json`

---

## Retrieval Methods

| Method | Description | Reliability |
|---|---|---|
| **Direct fetch** | URL fetched by agent in this session; HTML/text read directly | Highest |
| **Search grounding** | Google search result summaries and snippets reviewed | Medium — full page not read |
| **Agent memory** | Known fact without a session-retrieved URL | **Not used** — prohibited by Step 4 rules |

> **Important:** Salary benchmarks in `cities.json` and office rent ranges are derived entirely from **search grounding** (secondary summaries), not directly fetched report pages. They carry `"confidence": "estimated"` accordingly.

---

## Directly Fetched URLs (this session)

| URL | What was confirmed |
|---|---|
| `https://www.goldmansachs.com/worldwide/india/` | Bengaluru captive 2004, Helios Business Park campus |
| `https://mbrdi.co.in/about-us/` | Mercedes-Benz R&D India domain confirmed active (React SPA) |
| `https://www.astrazeneca.in/our-company/global-hub-india.html` | AstraZeneca India hub, ~1400 professionals Bengaluru |

---

## Search-Grounded Domains (gccs.json)

| Domain | Used for |
|---|---|
| nasscom.in | GCC landscape, talent benchmarks, city GCC counts |
| zinnov.com | GCC landscape India, semiconductor captives |
| businessofgcc.com | Company profiles, headcount, year_established (Barclays, EY, McKinsey, Goldman Sachs) |
| gccxglobal.com | City-level GCC directories — Hyderabad, Mumbai, Delhi NCR, Chennai |
| tracxn.com | Incorporation dates, employee counts (Target, BNY Mellon, Mastercard, Hyundai HMIE) |
| economictimes.com | Novartis Hyderabad headcount; AmEx Gurugram campus |
| americanexpress.com | AmEx Gurugram campus (snippet confirmed official page) |
| home.barclays | Barclays Pune press release Dec 2019 Kharadi campus |
| jpmorgan.com / peoplematters.in | JPMorgan Mumbai Powai campus capacity and timeline |
| db.com / techcircle.in | Deutsche Bank India total 22,000-23,000; Pune primary tech hub |
| bny.com | BNY Mellon / BNY Technology India presence |
| hmie.in / rankiteo.com | Hyundai Motor India Engineering Hyderabad |
| giftgujarat.in | GIFT City entity registry (banks, NSE IFSC, IIBX, KFintech) |
| longfinance.net | GIFT City financial centre report |
| pib.gov.in | Big Four in GIFT City |
| mckinsey.com | McKinsey GCS India, year 1998 |
| ey.com | EY GDS India year 2002, 80,000+ professionals |
| analyticsindiamag.com | Morgan Stanley Mumbai Commerz III campus |
| inductusgcc.com | AstraZeneca, Philips India GCC profiles |
| flexiple.com | Chennai GCC directory |

---

## Sources for cities.json (Salary & Rent Benchmarks)

**All salary and rent figures are estimates derived from search result summaries. No JLL, CBRE, Cushman & Wakefield, or Knight Frank report pages were directly fetched. Treat all talent and office figures as indicative ranges only.**

| City | Salary Source Domains | Rent Source Domains |
|---|---|---|
| Bengaluru | nasscom.in, quantalent.ai, talhive.com | jll.com, cbre.co.in, cushmanwakefield.com |
| Hyderabad | nasscom.in, quantalent.ai, hrbx.in | jll.com, cushmanwakefield.com, cbre.co.in |
| Pune | nasscom.in, talhive.com, hrbx.in | cushmanwakefield.com, cbre.co.in, jll.com |
| Chennai | nasscom.in, omnivoo.com, talhive.com | theflexinsights.com, cushmanwakefield.com, jll.com |
| Delhi NCR | nasscom.in, quantalent.ai | jll.com, cbre.co.in, cushmanwakefield.com |
| Mumbai | nasscom.in, talhive.com, gccnexus.com | anarock.com, cushmanwakefield.com, cbre.co.in |
| Ahmedabad | fortuneindia.com, nasscom.in | gandhinagarprojects.com, crematrix.com, pikorua.in |

---

## Sources for incentives.json

**No state government policy PDF was directly fetched. All incentive figures are from secondary sources. Verify against official state policy documents before any investment decision.**

| State | Primary Source Domains | Retrieval Method |
|---|---|---|
| Karnataka | nasscom.in, businessofgcc.com | Search grounding |
| Telangana | ts.gov.in (snippets), nasscom.in | Search grounding |
| Maharashtra | maharashtrainvestment.com, nasscom.in | Search grounding |
| Tamil Nadu | tn.gov.in (snippets), nasscom.in | Search grounding |
| Haryana | haryanaindustries.gov.in (snippets) | Search grounding |
| Gujarat | gujratinformatics.com, giftgujarat.in | Search grounding |
| Uttar Pradesh | invest.up.gov.in (snippets) | Search grounding |
| Central Government | meit.gov.in, nasscom.in | Search grounding |
