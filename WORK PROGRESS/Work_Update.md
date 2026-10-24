# GCC Atlas — Work Progress & Handover Document

**Last Updated:** October 24, 2026 (Night wrap-up)  
**Project:** GCC Atlas — Single Source of Truth for India's Global Capability Centre (GCC) Ecosystem  
**Repository Path:** `d:\PROJECTS\GCC Atlas`

---

## 1. Executive Summary

This document captures the entire progress of the **GCC Atlas** project from initialization up to the current milestone. When resuming tomorrow, review this document to instantly recall what is finished, the active rules/constraints, and the exact next action to trigger.

---

## 2. Standing Rules & Protocol

1. **GIT STANDING RULE (CRITICAL):**
   - The AI assistant **must NEVER run any git or GitHub commands** (`git init`, `add`, `commit`, `remote`, `push`, `pull`, `checkout`, etc.).
   - Whenever changes need version control, the assistant must provide a **`GIT STEP REQUIRED`** block containing:
     - Purpose of the commit (one line)
     - Exact commands in code blocks
     - Expected success output and failure warnings
     - Pre-commit safety check (ensuring `.env`, `.env.local`, `node_modules` are never tracked)
   - Only the user executes git commands in their own terminal.

2. **DATA INTEGRITY & SOURCING RULES:**
   - Every dataset record must include real `source_urls` and a `confidence` level:
     - `verified`: direct official source (company PR/website or official government portal).
     - `reported`: reputed news outlet (ET, Mint, BS, Reuters) or research firm (JLL, CBRE, Colliers, NASSCOM, Zinnov).
     - `estimated`: documented derivation.
   - **No fabricated or guessed data.** Unknown or missing values must strictly remain `null`.
   - Never attempt to force-access inaccessible government portals; log any fetch failures explicitly.

3. **LOCAL DIRECTORY IGNORE:**
   - The directory `WORK PROGRESS/` is listed in `.gitignore` so local handover notes are never committed to the public/remote repo.

---

## 3. Work Completed to Date

### Phase 0: Project Setup & Scaffolding
- [x] **`README.md`**: Completed with project overview, problem statement, key features (GCC Directory, City Explorer, Setup Advisor, Ask Atlas), tech stack, data principles, and setup guide.
- [x] **`.gitignore`**: Configured for Next.js, Node, TypeScript, environment secrets, and local progress tracking (`WORK PROGRESS/`).
- [x] **`.env.example`**: Configured with template for `GROQ_API_KEY`.
- [x] **Initial Git Block Provided**: Git command block for committing initial scaffolding and datasets prepared for the user.

### Phase 1: Research & Datasets
- [x] **Step 1: Data Architecture & Schemas**:
  - Defined strict JSON schemas for `incentives.json`, `cities.json`, and `gccs.json`.

- [x] **Step 2: State & Central Incentives (`data/incentives.json`)**:
  - Comprehensive coverage of GCC policies across key states:
    - Karnataka (KDEM / GCC Policy)
    - Telangana (ICT Policy 2.0 / GCC incentives)
    - Tamil Nadu (R&D Policy, IT/ITeS Policy)
    - Maharashtra (IT/ITeS Policy)
    - Gujarat & GIFT City (Fintech & IT Policy, IFSCA incentives)
    - Uttar Pradesh (IT Policy, Noida/Greater Noida)
    - Haryana (IT/ITeS Policy, Gurugram)
    - Central Government (STPI, SEZ Act, MeitY frameworks)
  - **Honesty Disclosures**: Every entry carries a transparent `notes` section stating whether data came from opened primary pages or search summary snippets, noting specific portal access statuses. No unearned `verified` ratings.

- [x] **Step 3: City Benchmarks (`data/cities.json`)**:
  - Detailed profiles for all 8 target cities:
    1. **Bengaluru** (Whitefield, Outer Ring Road, Electronic City)
    2. **Hyderabad** (HITEC City, Gachibowli, Financial District)
    3. **Pune** (Hinjawadi, Magarpatta, Kharadi, Viman Nagar)
    4. **Chennai** (OMR, Guindy, Ambattur, Taramani)
    5. **Delhi NCR** (Cyber City, Golf Course Ext, Noida Sectors 62/125-144)
    6. **Mumbai** (BKC, Powai, Malad, Navi Mumbai/Airoli)
    7. **Ahmedabad** (SG Highway, Prahlad Nagar, GIFT fringe)
    8. **GIFT City** (Processing & Non-Processing Zones, Tech Hub)
  - Commercial Real Estate: Grade A min/max rent per sq ft / month.
  - Talent & Salaries: Annual salary ranges (in INR Lakhs) across at least 4 key roles per city:
    - Software Engineer (3-5 years)
    - Data & AI Engineer
    - Finance & Accounting Analyst
    - Engineering Manager
  - Micro-markets, international airport connectivity, ecosystem tier, strengths, and bottlenecks.
  - Formatted and validated as valid JSON.
  - Note: `gcc_count_in_dataset` is currently set to `null` awaiting Step 4 compilation.

---

## 4. Current State & Pending Tasks

| Step | Task | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Step 4** | **Compile `data/gccs.json`** | 🟡 **Next Immediate Task** | Target 100–150 verified/reported GCCs across the 8 cities with headcount, sector, country of origin, year, and source URLs. |
| **Step 5** | **Cross-populate City Counts** | ⚪ Pending Step 4 | Update `gcc_count_in_dataset` inside `data/cities.json` with exact counts from `gccs.json`. |
| **Step 6** | **Dataset Git Commit** | ⚪ Pending Step 5 | Provide `GIT STEP REQUIRED` block for committing completed data files. |
| **Step 7** | **Frontend App Initialization** | ⚪ Future | Initialize Next.js project with Tailwind CSS, TypeScript, and shadcn/ui. |
| **Step 8** | **Core Feature Implementation** | ⚪ Future | Build Directory, City Explorer, Setup Advisor (Scoring Engine + Groq AI), and Ask Atlas. |

---

## 5. How to Resume Tomorrow

When you return tomorrow, you can simply say:
> *"Resume from Work_Update: let's start Step 4 (gccs.json)."*

The assistant will immediately:
1. Confirm reading this handover document.
2. Begin compiling the verified directory of 100–150 GCCs into [`data/gccs.json`](file:///d:/PROJECTS/GCC%20Atlas/data/gccs.json).
3. Validate and cross-link counts with [`data/cities.json`](file:///d:/PROJECTS/GCC%20Atlas/data/cities.json).
4. Provide the exact `GIT STEP REQUIRED` block for you to commit the entire dataset cleanly.
