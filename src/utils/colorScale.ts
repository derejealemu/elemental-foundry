import { BuilderVerdict, ComputedScores, ElementFamily, ElementRecord, HeatmapLens } from '../data/types';

export interface TileStyle {
  bg: string;
  border: string;
  text: string;
  muted: string;
  badgeText: string;
  metricValue: string;
}

export const LENS_METADATA: Record<
  HeatmapLens,
  {
    label: string;
    shortLabel: string;
    description: string;
    scaleLabels: [string, string, string];
    rampColorsDark: string[];
    rampColorsLight: string[];
  }
> = {
  'builder-score': {
    label: 'Builder Opportunity',
    shortLabel: 'Opportunity',
    description: 'Dynamic composite score weighted by your active Founder Thesis & CAPEX profile.',
    scaleLabels: ['Low / Unviable', 'Selective Niche', 'Prime Target (80+)'],
    rampColorsDark: ['#181f29', '#1e303c', '#184b4d', '#854d0e', '#d97706'],
    rampColorsLight: ['#e9e7df', '#d7e7ea', '#b7dfd9', '#fde68a', '#f59e0b'],
  },
  chokepoint: {
    label: 'Supply Chokepoint',
    shortLabel: 'Chokepoint',
    description: 'Geographic mining + midstream refining HHI concentration & byproduct fragility.',
    scaleLabels: ['Diversified (<30)', 'Concentrated (55)', 'Monopoly Risk (80+)'],
    rampColorsDark: ['#171e27', '#2b2a34', '#5c2c24', '#8f261f', '#c81e1e'],
    rampColorsLight: ['#eceae3', '#f3e2d3', '#f8c3a5', '#f3907c', '#dc2626'],
  },
  innovation: {
    label: 'Process Disruption',
    shortLabel: 'Disruption',
    description: 'Headroom for novel extraction, refining, electrochemistry, separation, or biomining.',
    scaleLabels: ['Mature Tech', 'Incremental', 'Ripe for Breakthrough'],
    rampColorsDark: ['#171e27', '#1c323f', '#154d63', '#0e7490', '#06b6d4'],
    rampColorsLight: ['#eceae3', '#d6edf2', '#a5dce8', '#5ec2d9', '#0891b2'],
  },
  'demand-growth': {
    label: 'Demand Tailwinds',
    shortLabel: 'Demand',
    description: '5–10 yr structural pull from AI compute, EVs, grid, SMRs, robotics & oncology.',
    scaleLabels: ['Flat / Declining', 'Steady Growth', 'Hyper-Growth (85+)'],
    rampColorsDark: ['#171e27', '#1a3228', '#174f38', '#15803d', '#22c55e'],
    rampColorsLight: ['#eceae3', '#d9eedf', '#a7dfb9', '#5ec884', '#16a34a'],
  },
  byproduct: {
    label: 'Byproduct Chain',
    shortLabel: 'Byproduct',
    description: 'Highlights elements tied to host metals (Al, Zn, Cu, Zr, Pt) — prime for modular recovery.',
    scaleLabels: ['Primary Mined', 'Co-Product', '100% Byproduct-Bound'],
    rampColorsDark: ['#171e27', '#29292f', '#4c381c', '#854d0e', '#ca8a04'],
    rampColorsLight: ['#eceae3', '#ece7d5', '#f7dfa4', '#f4c24d', '#ca8a04'],
  },
  'capex-feasibility': {
    label: 'Venture Modularity',
    shortLabel: 'Modular Fit',
    description: 'Feasibility of modular skids / urban-mining pilot plants under $25M CAPEX.',
    scaleLabels: ['Mega-CAPEX ($1B+)', 'Growth FOAK', 'Modular Skid (<$25M)'],
    rampColorsDark: ['#171e27', '#262b36', '#1b4342', '#0f766e', '#14b8a6'],
    rampColorsLight: ['#eceae3', '#dee3ea', '#b8e3de', '#67c8be', '#0d9488'],
  },
  family: {
    label: 'Chemical Family',
    shortLabel: 'Family',
    description: 'Classic periodic chemical groups paired with commercial metadata.',
    scaleLabels: ['Metals', 'Metalloids', 'Nonmetals & f-Block'],
    rampColorsDark: ['#7c2d12', '#1e3a5f', '#14532d', '#713f12', '#164e63'],
    rampColorsLight: ['#fed7aa', '#bfdbfe', '#bbf7d0', '#fef08a', '#bae6fd'],
  },
};

function getScoreBucket(score: number): number {
  if (score >= 82) return 4;
  if (score >= 68) return 3;
  if (score >= 52) return 2;
  if (score >= 30) return 1;
  return 0;
}

const FAMILY_STYLES_DARK: Record<ElementFamily, { bg: string; border: string }> = {
  alkali: { bg: '#3b1d1a', border: '#7f332a' },
  'alkaline-earth': { bg: '#3d2a16', border: '#855320' },
  transition: { bg: '#162436', border: '#2a476b' },
  'post-transition': { bg: '#162e2d', border: '#26605d' },
  metalloid: { bg: '#1a3022', border: '#2f6a45' },
  'reactive-nonmetal': { bg: '#262b1a', border: '#54612b' },
  halogen: { bg: '#32231c', border: '#744835' },
  'noble-gas': { bg: '#162a3a', border: '#295b80' },
  lanthanide: { bg: '#2f2617', border: '#735728' },
  actinide: { bg: '#2b1e24', border: '#6b3b4e' },
};

const FAMILY_STYLES_LIGHT: Record<ElementFamily, { bg: string; border: string }> = {
  alkali: { bg: '#fbe7e4', border: '#e3a69d' },
  'alkaline-earth': { bg: '#faeedc', border: '#dfc08c' },
  transition: { bg: '#e5eef8', border: '#a3c1e3' },
  'post-transition': { bg: '#e2f3f1', border: '#95cfc9' },
  metalloid: { bg: '#e3f4e8', border: '#96d1a8' },
  'reactive-nonmetal': { bg: '#f1f4e1', border: '#c4ce8f' },
  halogen: { bg: '#f9ebe2', border: '#dfb398' },
  'noble-gas': { bg: '#e2f1fa', border: '#92c7e6' },
  lanthanide: { bg: '#f7efe0', border: '#d9be8b' },
  actinide: { bg: '#f5e7ed', border: '#d6a4b9' },
};

export function getElementTileStyle(
  el: ElementRecord,
  scores: ComputedScores,
  lens: HeatmapLens,
  isDark: boolean
): TileStyle {
  const nonComm = !scores.isCommercial;

  if (lens === 'family') {
    const pal = isDark ? FAMILY_STYLES_DARK[el.family] : FAMILY_STYLES_LIGHT[el.family];
    return {
      bg: nonComm ? (isDark ? '#141820' : '#eceae3') : pal.bg,
      border: nonComm ? (isDark ? '#252d3a' : '#d5d1c6') : pal.border,
      text: isDark ? (nonComm ? '#6c7a8e' : '#eef2f7') : nonComm ? '#868d98' : '#14171c',
      muted: isDark ? '#98a6ba' : '#555e6b',
      badgeText: el.symbol,
      metricValue: nonComm ? 'SYN' : `${scores.builderScore}`,
    };
  }

  let value = 0;
  let metricValue = '';

  switch (lens) {
    case 'builder-score':
      value = scores.builderScore;
      metricValue = nonComm ? '—' : `${value}`;
      break;
    case 'chokepoint':
      value = scores.chokepointScore;
      metricValue = nonComm ? '—' : `${value}`;
      break;
    case 'innovation':
      value = el.metrics.innovationHeadroom;
      metricValue = nonComm ? '—' : `${value}`;
      break;
    case 'demand-growth':
      value = el.metrics.demandGrowth;
      metricValue = nonComm ? '—' : `${value}`;
      break;
    case 'byproduct':
      value = scores.byproductScore;
      metricValue = nonComm ? '—' : el.byproductOf ? 'BYP' : 'PRI';
      break;
    case 'capex-feasibility':
      value = el.metrics.modularFeasibility;
      metricValue = nonComm ? '—' : `${value}`;
      break;
  }

  if (nonComm) {
    return {
      bg: isDark ? '#11151c' : '#eceae2',
      border: isDark ? '#1f2633' : '#d8d4c8',
      text: isDark ? '#546175' : '#8d94a0',
      muted: isDark ? '#434e60' : '#9ca3af',
      badgeText: 'SYN',
      metricValue: '—',
    };
  }

  const bucket = getScoreBucket(value);
  const meta = LENS_METADATA[lens];
  const ramp = isDark ? meta.rampColorsDark : meta.rampColorsLight;
  const bg = ramp[bucket];

  // Crisp readable border slightly brighter/darker than tile bg
  const borderDark = ['#252f3d', '#2e4554', '#276868', '#a16207', '#f59e0b'];
  const borderLight = ['#d5d1c6', '#b5cfd4', '#7dc2b8', '#e2b94c', '#b45309'];
  const chokepointBorderDark = ['#252f3d', '#443e4f', '#803d33', '#b83227', '#f87171'];
  const chokepointBorderLight = ['#d5d1c6', '#dec1aa', '#e59a74', '#d95b46', '#991b1b'];

  let border = isDark ? borderDark[bucket] : borderLight[bucket];
  if (lens === 'chokepoint') {
    border = isDark ? chokepointBorderDark[bucket] : chokepointBorderLight[bucket];
  } else if (lens === 'innovation') {
    border = isDark
      ? ['#252f3d', '#294c5e', '#1e6e8a', '#1696b8', '#38bdf8'][bucket]
      : ['#d5d1c6', '#a8d3de', '#64bbd1', '#279db8', '#0e7490'][bucket];
  } else if (lens === 'demand-growth') {
    border = isDark
      ? ['#252f3d', '#274c3c', '#217552', '#1ea34e', '#4ade80'][bucket]
      : ['#d5d1c6', '#add6ba', '#6ac488', '#2da65b', '#15803d'][bucket];
  }

  // High contrast text rules (WCAG AA compliant on both light & dark scales)
  const useLightText = isDark
    ? true
    : bucket === 4 && (lens === 'chokepoint' || lens === 'innovation' || lens === 'demand-growth' || lens === 'capex-feasibility');

  const text = useLightText ? '#f8fafc' : '#14171c';
  const muted = useLightText
    ? bucket >= 3
      ? 'rgba(248, 250, 252, 0.82)'
      : '#94a3b8'
    : bucket >= 3
      ? '#262b33'
      : '#525b68';

  return {
    bg,
    border,
    text,
    muted,
    badgeText: metricValue,
    metricValue,
  };
}

export function getVerdictBadgeClasses(verdict: BuilderVerdict): string {
  switch (verdict) {
    case 'Prime Venture Target':
      return 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40';
    case 'Modular Separation / Recycling Play':
      return 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40';
    case 'High-Margin Niche / Isotope':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40';
    case 'Mega-CAPEX Decarbonization':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40';
    case 'Incumbent-Dominated Commodity':
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/35';
    case 'Regulatory / Toxicity Moat':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40';
    case 'Non-Commercial (Synthetic)':
      return 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30';
  }
}

export function formatUSDPrice(price: number): string {
  if (price <= 0) return 'N/A';
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 10_000) return `$${Math.round(price).toLocaleString()}`;
  if (price >= 100) return `$${Math.round(price)}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(3)}`;
}

