# Elemental Foundry

**An interactive 118-element industrial periodic table & hard-tech builder opportunity mapper.**

Elemental Foundry reframes the periodic table through an industrial, geopolitical, and commercialization lens—helping founders, researchers, and mineral-tech builders explore what each element is used for, how and where it is extracted and refined, where global bottlenecks sit, and where novel chemistry, electrochemistry, biomining, separation, or recycling processes have real startup leverage.

---

## Key Capabilities

- **18-Column Interactive Periodic Map (All 118 Elements)**
  - **7 Heatmap Lenses**: *Builder Opportunity Score*, *Supply Chokepoint (Mining + Refining HHI)*, *Process Disruption Headroom*, *Demand Tailwinds*, *Byproduct Chain*, *Venture Modularity (<\$25M CAPEX)*, and *Chemical Family*.
  - **Center-Top Telemetry HUD**: Live hover readout or top-4 ranked opportunities for your active founder thesis.
  - **Cross-Dimensional Search & Filters**: Search across element names, symbols, countries, processes (`Kroll`, `Bayer`, `DLE`, `bioleaching`, `AVLIS`), and end-use sectors.
- **Founder Thesis Calibration**
  - Switch across 6 playbooks (*All-Around Hard-Tech Builder*, *Electrochem & Separation Startup*, *Critical Minerals & Reshoring*, *Industrial Decarbonization*, *High-Margin Niche / Isotope*, *Biomining & Urban Mining*) or fine-tune custom sliders, CAPEX appetite, and regulatory/toxicity penalties to re-score all 118 elements live.
- **Deep-Dive Element Dossier & Unit-Economics Sandbox**
  - **Uses & Market**: Annual volume, benchmark price range, global market size, feedstock type, and industrial roles.
  - **How & Where**: 4-stage production flow with explicit chokepoint highlighting, ESG/energy realities, and Upstream Mining vs. Midstream Refining country concentration bars (with HHI).
  - **Builder Thesis**: 7-axis scorecard, *Why Build Here* vs. *What Kills Startups Here* reality checks, and concrete innovation angles with TRL tags.
  - **Economics Simulator**: Interactive sandbox for feedstock strategy, purity tier, plant scale, and OPEX/yield advantage.
- **Companion Analytical Views**
  - **Opportunity Matrix**: 2D SVG quadrant scatter plot with swappable X/Y axes and ranked sidebar.
  - **Bottlenecks & Chains**: Country refining monopolies, mining-vs-refining gaps, and the Byproduct Host Web (`Cu`, `Zn`, `Al`, `Pt`, `Zr`, `ASUs`, `REEs`).
  - **Shortlist & Diligence Export**: Side-by-side comparison table with CSV export.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

### Verification & Production Build

```bash
# Validate all 118 element records, grid coordinates, presets, and simulator math
npm run verify-data

# Type-check and build for production
npm run build
```

---

## Project Structure

```text
elemental-foundry/
├── scripts/
│   └── verify-data.ts          # 118-element integrity & preset scoring check
├── src/
│   ├── data/
│   │   ├── types.ts            # Domain schema & TypeScript interfaces
│   │   ├── elementsPart1.ts    # Z = 1–20  (H – Ca)
│   │   ├── elementsPart2.ts    # Z = 21–36 (Sc – Kr)
│   │   ├── elementsPart3.ts    # Z = 37–56 (Rb – Ba)
│   │   ├── elementsPart4.ts    # Z = 57–71 (Lanthanides / REEs)
│   │   ├── elementsPart5.ts    # Z = 72–88 (Hf – Ra)
│   │   ├── elementsPart6.ts    # Z = 89–118 (Actinides & Superheavies)
│   │   ├── scoring.ts          # HHI calculator, Founder Thesis engine & Unit-Economics Sim
│   │   └── index.ts            # Unified 118-element registry & byproduct dependency groups
│   ├── components/             # Periodic table, HUD, Dossier, Simulator, Matrix, Bottlenecks, Shortlist
│   └── utils/colorScale.ts     # Theme-aware WCAG-conscious heatmap palettes
└── vite.config.ts
```

---

## Data Note

Production shares, price ranges, and market sizes are indicative industrial benchmarks synthesized from public USGS Mineral Commodity Summaries, IEA Critical Minerals, and EU CRM reference baselines for strategic exploration and thesis generation. Always verify live spot pricing, regional permitting, and off-take terms before committing project capital.

## Status

Currently **private** while iterating on dataset depth, scoring calibration, and UI polish ahead of a planned open-source release.
