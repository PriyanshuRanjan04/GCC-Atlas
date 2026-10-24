# GCC Atlas — Data Quality Report

> Generated: 2026-10-24  
> Dataset version: post Step-4 + A/B/C/D classifications  
> Total records in gccs.json: **86**

---

## 1. Record Counts by City

| City | Total Records | captive_gcc | professional_services_delivery | regulated_ifsc_entity |
|---|---|---|---|---|
| Bengaluru | 18 | 17 | 1 | 0 |
| Hyderabad | 12 | 12 | 0 | 0 |
| Pune | 12 | 12 | 0 | 0 |
| Chennai | 10 | 10 | 0 | 0 |
| Delhi NCR | 12 | 7 | 5 | 0 |
| Mumbai | 10 | 10 | 0 | 0 |
| Ahmedabad | 12 | 0 | 4 | 8 |
| **TOTAL** | **86** | **68** | **10** | **8** |

> `gcc_count_in_dataset` in `cities.json` counts **captive_gcc only**. Ahmedabad = 0 captive GCCs in dataset.

---

## 2. Record Counts by Industry

| Industry | Count |
|---|---|
| BFSI | 40 |
| Professional Services | 10 |
| Manufacturing / Automotive | 7 |
| Healthcare / Life Sciences | 5 |
| BFSI / Fintech | 4 |
| Technology / Software | 5 |
| BFSI / Insurance | 3 |
| Technology / Semiconductors | 3 |
| Manufacturing / Energy | 2 |
| Retail / Consumer | 2 |
| Technology / Social Media | 1 |
| Technology / E-Commerce | 1 |
| Manufacturing / Agricultural | 1 |
| Manufacturing / Industrial | 2 |
| Technology / Hardware | 1 |

> BFSI concentration is inherent: Mumbai and Ahmedabad are by design pure-BFSI hubs.

---

## 3. Confidence Distribution

| Confidence | Count | % |
|---|---|---|
| reported | 85 | 98.8% |
| estimated | 1 | 1.2% |
| verified | 0 | 0.0% |

**Definitions:**
- `reported` — supported by at least one named secondary source (news article, GCC directory, consultant report) retrieved via search grounding in this session. The source was not always fully fetched.
- `estimated` — figure is inferred or calculated (e.g., city split of a national total). Currently only `gcc-pun-003` (Deutsche Bank Pune headcount).
- `verified` — would require an official company or government page directly fetched and read. **Zero records meet this standard yet** — even records backed by official domains (Goldman Sachs, AstraZeneca) were confirmed via search snippet rather than a fully rendered, scraped page.

---

## 4. Null Rate by Field

| Field | Null Count | Total | Null Rate |
|---|---|---|---|
| `headcount` | 64 | 86 | 74% |
| `year_established` | 70 | 86 | 81% |
| `entity_name_india` | 0 | 86 | 0% |
| `source_urls` | 0 | 86 | 0% |
| `confidence` | 0 | 86 | 0% |
| `entity_type` | 0 | 86 | 0% |

> High null rates for headcount and year_established are expected and correct. No record guesses these values. They will only be filled when an authoritative source is found.

---

## 5. Step C Verification Results (10 records)

| ID | Company | City | Result | Change Made |
|---|---|---|---|---|
| gcc-pun-003 | Deutsche Bank (Pune) | Pune | **CONFIRMED** (centre exists) | Notes updated to reference db.com; confidence remains `estimated` — city split still unverified |
| gcc-blr-001 | Goldman Sachs | Bengaluru | **CONFIRMED** | Notes updated: year 2004 + Helios campus confirmed via goldmansachs.com (official) |
| gcc-hyd-001 | Novartis | Hyderabad | **CONFIRMED** | Notes updated: ~9,000 employees confirmed by economictimes.com |
| gcc-ncr-001 | American Express | Gurugram | **CONFIRMED** | Notes updated: Sector 74A May 2024 confirmed by americanexpress.com + business-standard.com |
| gcc-pun-001 | Barclays | Pune | **CONFIRMED** | No change — home.barclays press release already cited |
| gcc-hyd-008 | Hyundai HMIE | Hyderabad | **CONFIRMED** | No change — hmie.in + tracxn.com already cited |
| gcc-chn-001 | Standard Chartered GBS | Chennai | **CONFIRMED** | No change — tracxn.com + theflexinsights.com already cited |
| gcc-mum-002 | Morgan Stanley | Mumbai | **CONFIRMED** | No change — analyticsindiamag.com already cited |
| gcc-blr-004 | AstraZeneca | Bengaluru | **CONFIRMED** | No change — astrazeneca.in fetched this session |
| gcc-ahm-009 | IIBX | Ahmedabad | **CONFIRMED** | No change — giftgujarat.in already cited; year 2022 correct |

**0 of 10 records failed. No records removed. No records corrected.**

---

## 6. Known Data Gaps and Conflicts

### Headcount
- 64 of 86 records have `null` headcount. Where headcount is present, it is a search-grounded range, not a company-disclosed figure, except possibly Novartis (~9,000 confirmed by multiple sources).
- Multi-city companies (Deutsche Bank, Barclays, Citi, BNY Mellon) have city-level splits that are **estimated**, not official.

### Year Established
- 70 of 86 records have `null` year_established.
- Years present are from secondary sources (tracxn incorporation dates, news articles). These are registration dates, not operational start dates.

### Salary & Rent
- All salary ranges in `cities.json` are **estimated** from search result summaries.
- Office rent ranges are from search-grounded broker report summaries, not directly fetched report PDFs.
- Neither JLL, CBRE, Cushman & Wakefield, nor Knight Frank pages were directly fetched.

### Incentives
- All incentive figures in `incentives.json` are from secondary sources. No state government policy PDF was fetched.

### GIFT City / Ahmedabad
- GIFT City entities (SBI, HDFC, Standard Chartered IFSC branches) are classified as `regulated_ifsc_entity`, not `captive_gcc`. They are genuine financial operating units but differ from traditional GCCs. The `gcc_count_in_dataset` for Ahmedabad is 0.

### Duplicate-city companies
- Several companies appear in multiple cities (Goldman Sachs: Bengaluru + Hyderabad + Mumbai; Barclays: Pune + Chennai + Mumbai; Citi: Pune + Chennai + Mumbai; Deutsche Bank: Pune + Mumbai; JPMorgan: Bengaluru + Gurugram + Mumbai). These are intentionally separate records.

---

## 7. Data Freshness

| File | Data As-Of |
|---|---|
| gccs.json | Search grounding conducted Oct 2026 session |
| cities.json (salary) | `"as_of": "2025-06"` (estimated) |
| cities.json (rent) | `"as_of": "2025-06"` (estimated) |
| incentives.json | Policy details from search grounding; policies may have been updated |
