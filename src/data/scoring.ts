import { ComputedScores, CountryShare, ElementRecord, FounderProfile } from './types';

export const FOUNDER_PRESETS: FounderProfile[] = [
  {
    id: 'balanced',
    name: 'All-Around Hard-Tech Builder',
    description:
      'Balances supply bottlenecks, process disruption headroom, structural demand growth, and venture-viable CAPEX.',
    weights: {
      chokepoint: 80,
      innovation: 85,
      demandGrowth: 75,
      marginPotential: 65,
      modularFeasibility: 70,
      recyclingPotential: 55,
    },
    capexTolerance: 'growth',
    penalizeRegulatory: true,
  },
  {
    id: 'separation',
    name: 'Electrochem & Separation Startup',
    description:
      'Prioritizes modular refining bottlenecks, brine/tailings hydrometallurgy, e-waste recovery, and low-CAPEX skids.',
    weights: {
      chokepoint: 85,
      innovation: 95,
      demandGrowth: 65,
      marginPotential: 75,
      modularFeasibility: 95,
      recyclingPotential: 90,
    },
    capexTolerance: 'venture',
    penalizeRegulatory: true,
  },
  {
    id: 'reshoring',
    name: 'Critical Minerals & Reshoring',
    description:
      'Maxes out geopolitical refining monopolies, allied supply-chain gaps, defense/chip criticality, and byproduct fragility.',
    weights: {
      chokepoint: 100,
      innovation: 70,
      demandGrowth: 80,
      marginPotential: 70,
      modularFeasibility: 60,
      recyclingPotential: 65,
    },
    capexTolerance: 'growth',
    penalizeRegulatory: false,
  },
  {
    id: 'decarb',
    name: 'Industrial Decarbonization (Mega-Scale)',
    description:
      'Hunts massive-tonnage commodity metals and chemicals with huge CO₂ footprints where zero-carbon process tech wins.',
    weights: {
      chokepoint: 35,
      innovation: 100,
      demandGrowth: 85,
      marginPotential: 40,
      modularFeasibility: 25,
      recyclingPotential: 50,
    },
    capexTolerance: 'industrial',
    penalizeRegulatory: false,
  },
  {
    id: 'specialty',
    name: 'High-Margin Niche / Isotope / Ultra-Pure',
    description:
      'Targets tiny-volume, ultra-high $/kg elements (5N–6N semiconductor precursors, radiopharma isotopes, noble gases).',
    weights: {
      chokepoint: 75,
      innovation: 80,
      demandGrowth: 85,
      marginPotential: 100,
      modularFeasibility: 85,
      recyclingPotential: 50,
    },
    capexTolerance: 'venture',
    penalizeRegulatory: false,
  },
  {
    id: 'biomining',
    name: 'Biomining & Urban Mining Venture',
    description:
      'Focuses on low-grade ores, smelter tailings, red mud, and e-waste streams ripe for bioleaching or selective biosorption.',
    weights: {
      chokepoint: 65,
      innovation: 90,
      demandGrowth: 70,
      marginPotential: 60,
      modularFeasibility: 90,
      recyclingPotential: 100,
    },
    capexTolerance: 'venture',
    penalizeRegulatory: true,
  },
];

export function calculateHHI(leaders: CountryShare[]): number {
  if (!leaders.length) return 0;
  let sumShares = 0;
  let hhi = 0;
  for (const item of leaders) {
    hhi += item.share * item.share;
    sumShares += item.share;
  }
  // Distribute remaining "Rest of World" conservatively across ~5 smaller producers
  const remainder = Math.max(0, 100 - sumShares);
  if (remainder > 0) {
    const chunk = remainder / 5;
    hhi += 5 * chunk * chunk;
  }
  return Math.round(Math.min(10000, hhi));
}

export function normalizeHHI(hhi: number): number {
  if (hhi <= 0) return 0;
  // 1000 = fragmented (~15), 2500 = moderately concentrated (~45), 5000 = dominant (~75), 8000+ = monopoly (95-100)
  const score = Math.round(Math.min(100, Math.pow(hhi / 10000, 0.58) * 100));
  return score;
}

export function computeElementScores(
  el: ElementRecord,
  profile: FounderProfile
): ComputedScores {
  const isCommercial = el.commercialTier !== 'Non-Commercial Synthetic';

  const miningHHI = calculateHHI(el.miningLeaders);
  const refiningHHI = calculateHHI(el.refiningLeaders);
  const weightedHHI = refiningHHI > 0 && miningHHI > 0
    ? miningHHI * 0.35 + refiningHHI * 0.65
    : Math.max(miningHHI, refiningHHI);

  const rawChokepoint = normalizeHHI(weightedHHI);
  // Boost slightly if byproduct-dependent (price inelasticity)
  const byproductBonus = el.byproductOf ? 8 : 0;
  const chokepointScore = isCommercial ? Math.min(100, rawChokepoint + byproductBonus) : 0;

  const byproductScore = !isCommercial
    ? 0
    : el.feedstockType === 'Industrial Byproduct'
      ? Math.min(100, 72 + Math.round(chokepointScore * 0.28))
      : el.byproductOf
        ? 62
        : el.feedstockType === 'Nuclear Reactor / Accelerator'
          ? 52
          : el.feedstockType === 'Brine / Evaporite'
            ? 32
            : 15;

  const topMiner = el.miningLeaders.length
    ? [...el.miningLeaders].sort((a, b) => b.share - a.share)[0]
    : null;
  const topRefiner = el.refiningLeaders.length
    ? [...el.refiningLeaders].sort((a, b) => b.share - a.share)[0]
    : null;

  if (!isCommercial) {
    return {
      miningHHI: 0,
      refiningHHI: 0,
      chokepointScore: 0,
      topMiner: null,
      topRefiner: null,
      builderScore: 3,
      byproductScore: 0,
      isCommercial: false,
    };
  }

  const w = profile.weights;
  const totalWeight =
    w.chokepoint +
    w.innovation +
    w.demandGrowth +
    w.marginPotential +
    w.modularFeasibility +
    w.recyclingPotential;

  const safeWeight = totalWeight > 0 ? totalWeight : 1;

  let weightedSum =
    chokepointScore * w.chokepoint +
    el.metrics.innovationHeadroom * w.innovation +
    el.metrics.demandGrowth * w.demandGrowth +
    el.metrics.marginPotential * w.marginPotential +
    el.metrics.modularFeasibility * w.modularFeasibility +
    el.metrics.recyclingPotential * w.recyclingPotential;

  let score = weightedSum / safeWeight;

  // CAPEX tolerance & Playbook Thesis differentiation
  if (profile.capexTolerance === 'venture') {
    if (el.capexTier === 'Venture Modular (<$25M)') score += 6;
    if (el.capexTier === 'Industrial Mega-CAPEX ($250M+)') score -= 15;
    if (el.capexTier === 'Accelerator / Nuclear License' && profile.id !== 'specialty') score -= 4;
  } else if (profile.capexTolerance === 'industrial') {
    // Mega-scale decarbonization prioritizes huge global tonnage & CO2 abatement impact
    if (el.marketSizeBillions >= 50) score += 16;
    else if (el.marketSizeBillions >= 15) score += 11;
    else if (el.marketSizeBillions < 2) score -= 16;
    if (el.verdict === 'Mega-CAPEX Decarbonization') score += 9;
  }

  // Playbook-specific domain boosts so each founder lens genuinely reshapes the periodic table
  if (profile.id === 'specialty') {
    if (el.basePricePerKgUSD >= 1000) score += 9;
    else if (el.basePricePerKgUSD < 20) score -= 12;
    if (
      el.commercialTier === 'Radiopharma / Nuclear' ||
      el.innovationAngles.some((a) => a.approach === 'Isotope / Accelerator')
    ) {
      score += 10;
    }
  } else if (profile.id === 'biomining') {
    const hasBioOrUrban = el.innovationAngles.some(
      (a) => a.approach === 'Biomining / SynBio' || a.approach === 'Urban Mining / Recycling'
    );
    if (hasBioOrUrban) score += 8;
    else score -= 8;
    if (el.metrics.recyclingPotential >= 88) score += 6;
  } else if (profile.id === 'separation') {
    const hasSepOrElectro = el.innovationAngles.some(
      (a) => a.approach === 'Separation / Membranes' || a.approach === 'Electrochemistry'
    );
    if (hasSepOrElectro) score += 6;
    if (el.byproductOf) score += 5;
  } else if (profile.id === 'reshoring') {
    if (el.criticalStatus === 'US & EU Critical') score += 6;
    if ((topRefiner?.share ?? 0) >= 75) score += 6;
  }

  // Regulatory penalty if enabled
  if (profile.penalizeRegulatory && el.metrics.regulatoryFriction >= 65) {
    score -= Math.round((el.metrics.regulatoryFriction - 60) * 0.35);
  }

  // Niche/Research gentle ceiling unless specialty preset
  if (el.commercialTier === 'Niche / Research' && profile.id !== 'specialty') {
    score = Math.min(score, 58);
  }

  const builderScore = Math.max(5, Math.min(98, Math.round(score)));

  return {
    miningHHI,
    refiningHHI,
    chokepointScore,
    topMiner,
    topRefiner,
    builderScore,
    byproductScore,
    isCommercial: true,
  };
}

export interface SimulationInputs {
  feedstockStrategy: 'primary' | 'byproduct-tailings' | 'urban-recycling';
  purityTier: 'industrial' | 'battery-chemical' | 'semiconductor-5n';
  costAdvantagePct: number; // 5 - 55%
  plantScale: 'pilot' | 'modular' | 'commercial';
}

export interface SimulationResult {
  estimatedRealizedPriceUSD: number;
  purityMultiplier: number;
  grossMarginBand: string;
  estimatedCapexBand: string;
  timeToRevenueMonths: string;
  viabilitySignal: 'High Leverage' | 'Viable with Offtake' | 'Capital Heavy' | 'Unviable';
  strategicNote: string;
}

export function runUnitEconomicsSim(
  el: ElementRecord,
  scores: ComputedScores,
  inputs: SimulationInputs
): SimulationResult {
  if (!scores.isCommercial || el.basePricePerKgUSD <= 0) {
    return {
      estimatedRealizedPriceUSD: 0,
      purityMultiplier: 1,
      grossMarginBand: 'N/A',
      estimatedCapexBand: '>$500M (Particle Physics Facility)',
      timeToRevenueMonths: 'N/A (Non-Commercial)',
      viabilitySignal: 'Unviable',
      strategicNote:
        'Half-life and synthesis yields make commercial extraction impossible. Focus instead on accelerator instrumentation or stable isotopic analogs.',
    };
  }

  const purityMultiplier =
    inputs.purityTier === 'industrial'
      ? 1.0
      : inputs.purityTier === 'battery-chemical'
        ? el.sectors.includes('Energy Storage') || el.sectors.includes('Clean Energy & Grid')
          ? 2.2
          : 1.7
        : el.sectors.includes('Semiconductors') || el.sectors.includes('Optics & Photonics')
          ? 6.5
          : 3.4;

  const estimatedRealizedPriceUSD = el.basePricePerKgUSD * purityMultiplier;

  // Compute illustrative margin lift from purity + process cost advantage + feedstock choice
  let baseMargin = 18;
  if (inputs.purityTier === 'battery-chemical') baseMargin += 9;
  if (inputs.purityTier === 'semiconductor-5n') baseMargin += 22;
  if (inputs.feedstockStrategy === 'byproduct-tailings') {
    baseMargin += el.byproductOf ? 12 : 5;
  }
  if (inputs.feedstockStrategy === 'urban-recycling') {
    baseMargin += el.metrics.recyclingPotential >= 65 ? 11 : -4;
  }
  baseMargin += Math.round(inputs.costAdvantagePct * 0.55);
  const clampedLow = Math.max(8, Math.min(72, baseMargin - 6));
  const clampedHigh = Math.max(16, Math.min(82, baseMargin + 7));

  let capexLow = 12;
  let capexHigh = 35;
  if (inputs.plantScale === 'pilot') {
    capexLow = 2;
    capexHigh = 8;
  } else if (inputs.plantScale === 'modular') {
    capexLow = el.metrics.modularFeasibility >= 65 ? 12 : 30;
    capexHigh = el.metrics.modularFeasibility >= 65 ? 40 : 90;
  } else {
    capexLow = el.capexTier === 'Industrial Mega-CAPEX ($250M+)' ? 350 : 90;
    capexHigh = el.capexTier === 'Industrial Mega-CAPEX ($250M+)' ? 1400 : 280;
  }
  if (inputs.feedstockStrategy === 'primary' && el.feedstockType === 'Primary Ore') {
    capexLow = Math.round(capexLow * 1.6);
    capexHigh = Math.round(capexHigh * 1.8);
  }

  let monthsLow = 14;
  let monthsHigh = 24;
  if (inputs.feedstockStrategy === 'primary') {
    monthsLow += 36;
    monthsHigh += 60;
  } else if (inputs.feedstockStrategy === 'byproduct-tailings') {
    monthsLow += 8;
    monthsHigh += 16;
  }
  if (inputs.purityTier === 'semiconductor-5n') {
    monthsLow += 12; // fab qualification cycle
    monthsHigh += 20;
  }
  if (el.metrics.regulatoryFriction >= 75) {
    monthsLow += 14;
    monthsHigh += 24;
  }

  let viabilitySignal: SimulationResult['viabilitySignal'] = 'Viable with Offtake';
  if (clampedLow >= 32 && capexHigh <= 80 && monthsHigh <= 48) {
    viabilitySignal = 'High Leverage';
  } else if (capexLow >= 250 || monthsLow >= 54) {
    viabilitySignal = 'Capital Heavy';
  } else if (inputs.feedstockStrategy === 'urban-recycling' && el.metrics.recyclingPotential < 30) {
    viabilitySignal = 'Unviable';
  }

  let strategicNote = '';
  if (inputs.feedstockStrategy === 'urban-recycling' && el.metrics.recyclingPotential < 35) {
    strategicNote = `Warning: ${el.name} has dispersed dissipative uses and weak scrap collection loops. Pivot to byproduct/tailings recovery or primary process licensing.`;
  } else if (inputs.feedstockStrategy === 'primary' && el.byproductOf) {
    strategicNote = `${el.name} is rarely viable as a standalone mine because it occurs inside ${el.byproductOf}. Partnering directly with host smelters/refiners via modular side-stream extraction cuts CAPEX and permitting dramatically.`;
  } else if (inputs.purityTier === 'semiconductor-5n' && el.sectors.includes('Semiconductors')) {
    strategicNote = `5N–6N purification captures a massive spread over commodity ${el.symbol}, but budget 18–24 months for Tier-1 fab qualification and analytical QA/QC labs.`;
  } else if (inputs.plantScale === 'modular' && el.metrics.modularFeasibility >= 65) {
    strategicNote = `Strong modular skid fit: deploy containerized extraction or toll-refining units directly at customer/host sites to secure non-dilutive DOE/allied grants and prepay offtake.`;
  } else {
    strategicNote = `Lock in binding take-or-pay offtake agreements with ${el.typicalOfftakers[0] || 'industrial buyers'} before committing FOAK commercial CAPEX.`;
  }

  return {
    estimatedRealizedPriceUSD,
    purityMultiplier,
    grossMarginBand: `${clampedLow}%–${clampedHigh}%`,
    estimatedCapexBand: `$${capexLow}M–$${capexHigh}M`,
    timeToRevenueMonths: `${monthsLow}–${monthsHigh} mo`,
    viabilitySignal,
    strategicNote,
  };
}

