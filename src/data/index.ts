import { ELEMENTS_PART_1 } from './elementsPart1';
import { ELEMENTS_PART_2 } from './elementsPart2';
import { ELEMENTS_PART_3 } from './elementsPart3';
import { ELEMENTS_PART_4 } from './elementsPart4';
import { ELEMENTS_PART_5 } from './elementsPart5';
import { ELEMENTS_PART_6 } from './elementsPart6';
import { ElementFamily, ElementRecord, Sector } from './types';

export const ELEMENTS: ElementRecord[] = [
  ...ELEMENTS_PART_1,
  ...ELEMENTS_PART_2,
  ...ELEMENTS_PART_3,
  ...ELEMENTS_PART_4,
  ...ELEMENTS_PART_5,
  ...ELEMENTS_PART_6,
].sort((a, b) => a.z - b.z);

export const ELEMENT_BY_Z: Map<number, ElementRecord> = new Map(
  ELEMENTS.map((el) => [el.z, el])
);

export const ELEMENT_BY_SYMBOL: Map<string, ElementRecord> = new Map(
  ELEMENTS.map((el) => [el.symbol.toLowerCase(), el])
);

export const FAMILY_LABELS: Record<ElementFamily, string> = {
  alkali: 'Alkali Metals',
  'alkaline-earth': 'Alkaline Earth',
  transition: 'Transition Metals',
  'post-transition': 'Post-Transition',
  metalloid: 'Metalloids',
  'reactive-nonmetal': 'Reactive Nonmetals',
  halogen: 'Halogens',
  'noble-gas': 'Noble Gases',
  lanthanide: 'Lanthanides (REEs)',
  actinide: 'Actinides',
};

export const ALL_SECTORS: Sector[] = [
  'Semiconductors',
  'Energy Storage',
  'Clean Energy & Grid',
  'Aerospace & Defense',
  'MedTech & Pharma',
  'Optics & Photonics',
  'Chemicals & Catalysts',
  'Steel & Construction',
  'Quantum & Cryogenics',
  'Agriculture',
];

export interface ByproductHostGroup {
  host: string;
  hostSymbol: string;
  hostZ: number;
  description: string;
  dependents: ElementRecord[];
}

export function getByproductHostGroups(): ByproductHostGroup[] {
  const specs: { host: string; hostSymbol: string; hostZ: number; description: string; symbols: string[] }[] = [
    {
      host: 'Copper Refining & Smelting',
      hostSymbol: 'Cu',
      hostZ: 29,
      description: 'Anode slimes, porphyry roaster off-gas & Cu-Co deposits unlock critical minor metals.',
      symbols: ['Co', 'Mo', 'Re', 'Te', 'Se', 'Ag', 'As', 'Bi'],
    },
    {
      host: 'Zinc Sphalerite Smelting',
      hostSymbol: 'Zn',
      hostZ: 30,
      description: 'Jarosite/goethite leach residues & flue dusts hold high-value electronics & photonics elements.',
      symbols: ['Ge', 'In', 'Ga', 'Cd', 'Tl'],
    },
    {
      host: 'Alumina Bayer Process & TiO₂',
      hostSymbol: 'Al',
      hostZ: 13,
      description: 'Circulating caustic Bayer liquor & red mud tailings are the #1 source of Ga and Sc.',
      symbols: ['Ga', 'Sc'],
    },
    {
      host: 'Platinum Group Mining (PGMs)',
      hostSymbol: 'Pt',
      hostZ: 78,
      description: 'South African & Russian Pt/Ni ores co-produce inelastic ultra-scarce catalysts.',
      symbols: ['Ir', 'Ru', 'Rh', 'Pd', 'Os'],
    },
    {
      host: 'Zirconium Nuclear Purification',
      hostSymbol: 'Zr',
      hostZ: 40,
      description: 'Splitting ~2% Hf from zircon sand is the sole source of semiconductor & hypersonic Hafnium.',
      symbols: ['Hf'],
    },
    {
      host: 'Cryogenic Air Separation (ASUs)',
      hostSymbol: 'O',
      hostZ: 8,
      description: 'Giant steel-mill air plants capture ultra-trace noble gases powering chip lasers & satellites.',
      symbols: ['Ar', 'Ne', 'Kr', 'Xe'],
    },
    {
      host: 'Heavy Rare Earth Clays & Monazite',
      hostSymbol: 'Nd',
      hostZ: 60,
      description: 'Joint REE processing couples oversupplied La/Ce with chokepoint magnet & laser REEs.',
      symbols: ['Pr', 'Dy', 'Tb', 'Sm', 'Gd', 'Y', 'Yb', 'Lu', 'Er', 'Ho', 'Tm', 'Eu', 'Th'],
    },
  ];

  return specs.map((spec) => ({
    host: spec.host,
    hostSymbol: spec.hostSymbol,
    hostZ: spec.hostZ,
    description: spec.description,
    dependents: spec.symbols
      .map((sym) => ELEMENT_BY_SYMBOL.get(sym.toLowerCase()))
      .filter((e): e is ElementRecord => Boolean(e)),
  }));
}

