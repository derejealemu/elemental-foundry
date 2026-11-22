export type ElementFamily =
  | 'alkali'
  | 'alkaline-earth'
  | 'transition'
  | 'post-transition'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export type CommercialTier =
  | 'Critical Strategic'
  | 'Industrial Commodity'
  | 'High-Tech Specialty'
  | 'Radiopharma / Nuclear'
  | 'Niche / Research'
  | 'Non-Commercial Synthetic';

export type CriticalStatus =
  | 'US & EU Critical'
  | 'US Critical'
  | 'EU Critical'
  | 'Strategic Watch'
  | 'Standard Commodity'
  | 'Not Applicable';

export type Sector =
  | 'Semiconductors'
  | 'Energy Storage'
  | 'Aerospace & Defense'
  | 'Clean Energy & Grid'
  | 'Chemicals & Catalysts'
  | 'MedTech & Pharma'
  | 'Steel & Construction'
  | 'Optics & Photonics'
  | 'Quantum & Cryogenics'
  | 'Agriculture'
  | 'Research Only';

export type FeedstockType =
  | 'Primary Ore'
  | 'Brine / Evaporite'
  | 'Industrial Byproduct'
  | 'Air / Natural Gas'
  | 'Seawater / Halide'
  | 'Nuclear Reactor / Accelerator'
  | 'Synthetic Particle Beam';

export type CapexTier =
  | 'Venture Modular (<$25M)'
  | 'Growth FOAK ($25M–$250M)'
  | 'Industrial Mega-CAPEX ($250M+)'
  | 'Accelerator / Nuclear License'
  | 'Unviable (Lab Only)';

export type BuilderVerdict =
  | 'Prime Venture Target'
  | 'Modular Separation / Recycling Play'
  | 'High-Margin Niche / Isotope'
  | 'Mega-CAPEX Decarbonization'
  | 'Incumbent-Dominated Commodity'
  | 'Regulatory / Toxicity Moat'
  | 'Non-Commercial (Synthetic)';

export type InnovationApproach =
  | 'Electrochemistry'
  | 'Separation / Membranes'
  | 'Biomining / SynBio'
  | 'Urban Mining / Recycling'
  | 'Pyrometallurgy / Plasma'
  | 'Isotope / Accelerator'
  | 'Process Catalysis';

export interface CountryShare {
  country: string;
  share: number;
}

export interface ProductionStep {
  stage: 'Feedstock' | 'Extraction' | 'Refining' | 'Commercial Form';
  process: string;
  isBottleneck?: boolean;
}

export interface ApplicationItem {
  title: string;
  detail: string;
  share?: string;
}

export interface InnovationAngle {
  title: string;
  approach: InnovationApproach;
  summary: string;
  trl: string;
}

export interface ElementMetrics {
  innovationHeadroom: number; // 0-100
  demandGrowth: number; // 0-100
  marginPotential: number; // 0-100
  modularFeasibility: number; // 0-100
  recyclingPotential: number; // 0-100
  regulatoryFriction: number; // 0-100 (higher = harder)
}

export interface ElementRecord {
  z: number;
  symbol: string;
  name: string;
  mass: string;
  period: number;
  group: number | null;
  gridRow: number; // 1-7 main, 9 lanthanides, 10 actinides
  gridCol: number; // 1-18
  family: ElementFamily;
  stateAtSTP: 'Solid' | 'Liquid' | 'Gas' | 'Synthetic';

  commercialTier: CommercialTier;
  criticalStatus: CriticalStatus;
  annualProduction: string;
  priceRange: string;
  basePricePerKgUSD: number;
  marketSizeUSD: string;
  marketSizeBillions: number;
  sectors: Sector[];
  applications: ApplicationItem[];

  feedstockType: FeedstockType;
  byproductOf?: string;
  productionSteps: ProductionStep[];
  bottleneckNote: string;
  environmentalFootprint: string;
  miningLeaders: CountryShare[];
  refiningLeaders: CountryShare[];

  metrics: ElementMetrics;
  capexTier: CapexTier;
  verdict: BuilderVerdict;
  builderSummary: string;
  whyBuild: string[];
  startupKillers: string[];
  innovationAngles: InnovationAngle[];
  recommendedWedge: string;
  typicalOfftakers: string[];
}

export type HeatmapLens =
  | 'builder-score'
  | 'chokepoint'
  | 'innovation'
  | 'demand-growth'
  | 'byproduct'
  | 'capex-feasibility'
  | 'family';

export type WorkspaceView = 'table' | 'matrix' | 'bottlenecks' | 'shortlist';

export interface FounderProfile {
  id: string;
  name: string;
  description: string;
  weights: {
    chokepoint: number; // 0-100
    innovation: number; // 0-100
    demandGrowth: number; // 0-100
    marginPotential: number; // 0-100
    modularFeasibility: number; // 0-100
    recyclingPotential: number; // 0-100
  };
  capexTolerance: 'venture' | 'growth' | 'industrial';
  penalizeRegulatory: boolean;
}

export interface ComputedScores {
  miningHHI: number; // 0-10000
  refiningHHI: number; // 0-10000
  chokepointScore: number; // 0-100 normalized
  topRefiner: CountryShare | null;
  topMiner: CountryShare | null;
  builderScore: number; // 0-100 dynamic
  byproductScore: number; // 0-100
  isCommercial: boolean;
}

