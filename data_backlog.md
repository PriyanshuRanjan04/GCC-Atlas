# GCC Atlas — Data Backlog

> Created: 2026-10-24. Items to complete before production release.  
> Owner: add to the next research session. Do not edit data files based on memory — every fill-in requires a retrieved source.

---

## 1. Records Not Yet Verified (source page not directly fetched)

All 85 "reported" records have search-grounded sources but no directly fetched page read. Priority verification targets (high-impact / most-cited):

- gcc-blr-002 (Walmart Global Tech) — verify headcount 11,000–13,000 via tracxn.com or walmart.com
- gcc-blr-003 (Target India) — verify headcount ~5,700 via deere.co.in or target.com
- gcc-blr-005 (Fidelity) — verify India total via fidelity.com careers or annual report
- gcc-pun-001 (Barclays) — home.barclays press release URL should be fetched to upgrade to "verified"
- gcc-chn-002 (RNTBCI) — rntbci.in about page returned 404; re-check URL structure
- gcc-ncr-002 (McKinsey) — mckinsey.com/careers/our-locations/india should be fetched
- gcc-mum-001 (JPMorgan Powai) — peoplematters.in or ET article should be fetched to confirm 30,000 capacity
- gcc-mum-002 (Morgan Stanley) — analyticsindiamag.com article should be fetched for Commerz III headcount
- gcc-ahm-007 (NSE IFSC) — nseindia.com IFSC page should be fetched
- gcc-blr-015 to gcc-blr-018, gcc-hyd-011, gcc-hyd-012 — all 6 new B-records need official page fetch

---

## 2. Cities/Industries with Thin Coverage

- **Ahmedabad**: 0 captive_gcc in dataset — no non-BFSI/non-IFSC GCC found. Suggest 3–5 records from tech or manufacturing companies if any set up in GIFT City domestic zone or SG Highway.
- **Delhi NCR tech GCCs**: Only 7 captive_gcc; only 1 non-BFSI (AmEx, which is BFSI). Suggest adding Google India Gurugram, Uber India Gurugram, and Samsung R&D Noida (up to 3 records).
- **Healthcare/Pharma outside Hyderabad**: Only AstraZeneca in Bengaluru/Chennai and Novartis + Bayer in Hyderabad. Suggest Abbott India, Sanofi, Roche — all have reported India GCCs.
- **Semiconductors**: Only Intel, Qualcomm, Texas Instruments, Philips in dataset. Suggest Micron India (Bengaluru), Arm India (Bengaluru), NXP Semiconductors.
- **Mumbai non-BFSI**: 0 non-BFSI GCCs in Mumbai. Suggest Maersk India (Powai), Siemens India tech hub — both reported in search grounding.

---

## 3. Fields with High Null Rates

- **headcount** (74% null): Can be filled from: tracxn.com company pages, LinkedIn headcount estimates, company annual reports, NASSCOM GCC survey reports (paywalled), glassdoor.com company overviews.
- **year_established** (81% null): Can be filled from: MCA (Ministry of Corporate Affairs) company search mca.gov.in (incorporation year as proxy), tracxn.com, Zinnov GCC landscape reports, company press releases.

---

## 4. Salary and Rent Figures Still Based on Estimates

- All 7 cities salary ranges in `cities.json` are estimated from search snippets referencing NASSCOM, quantalent.ai, talhive.com, hrbx.in — **none of these pages were fetched**.
- Reports that would replace estimates: NASSCOM GCC Talent India (annual, paywalled), Zinnov GCC Landscape India, Aon Salary Survey India, Mercer Total Remuneration Survey India.
- All 7 cities office rent ranges are from search snippets referencing JLL, CBRE, Cushman & Wakefield India market reports — **none fetched**.
- Reports that would replace estimates: JLL India Office Market Outlook Q2 2025 (quarterly PDF, publicly available), CBRE India Market Snapshot, Knight Frank India Market Monitor.

---

## 5. Incentive Records Still Based on Secondary Sources

- All 8 state incentive records in `incentives.json` are from secondary sources only.
- Official documents to find:
  - Karnataka: "Karnataka GCC Policy 2024-29" — available at investkarnataka.co.in (search for PDF)
  - Telangana: "TS-GCC Policy 2024" — ts.gov.in/it-policy
  - Maharashtra: "Maharashtra IT/ITeS Policy 2023" — mahaonline.gov.in
  - Tamil Nadu: "Tamil Nadu GCC Policy" — investtn.in
  - Haryana: "Haryana Enterprise Promotion Policy 2020" — haryanaindustries.gov.in
  - Gujarat: "Gujarat GCC Policy 2025-30" — gujratinformatics.com or ic.gujarat.gov.in
  - Uttar Pradesh: "UP GCC Policy 2024" — invest.up.gov.in
  - Central: SEZ Act Rules and STPI guidelines — sezindia.nic.in

---

## 6. Other Known Gaps and Doubts

- **Worldline India (gcc-chn-008)**: Worldline SA serves third-party payment clients; entity_type is set to `captive_gcc` because the India entity serves Worldline group's own operations — but this is borderline. Review when adding service_provider classification logic.
- **S&P Global (gcc-ncr-010)**: Classified `captive_gcc` but S&P also sells data to external clients; India entity primarily supports internal operations. Borderline — keep but flag for review.
- **Aon (gcc-ncr-008)**: Aon India Insurance Brokers serves Aon group clients; insurance broking is technically serving third parties but through a captive entity. Keep as `captive_gcc` but note ambiguity.
- **BNY Mellon vs BNY Technology (gcc-pun-002 vs gcc-pun-011)**: Two separate legal entities in Pune under the BNY umbrella. Headcount split is estimated. Merge into one record if the legal distinction is not needed for the prototype.
- **city field for Delhi NCR**: Using "Delhi NCR" as city value; state is "Haryana / Uttar Pradesh / Delhi" for combined records. For records with a specific sub-location (e.g., Noida = UP, Gurugram = Haryana), the state field is set to the specific state. Consistent filtering logic will be needed in the app.
- **No "verified" confidence records**: The bar for "verified" (official company/government page directly fetched and read) was not met for any record in this session. All remain "reported". Upgrade path: fetch official page URLs listed in source_urls for priority records.
- **GIFT City domestic zone GCCs**: No non-BFSI, non-Big4 GCC in GIFT City domestic zone was found. This is a real gap in the market, not a dataset gap — but should be confirmed by checking giftgujarat.in entity list directly.
