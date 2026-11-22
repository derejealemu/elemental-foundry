import { ELEMENTS } from '../src/data';
import { computeElementScores, FOUNDER_PRESETS, runUnitEconomicsSim } from '../src/data/scoring';

let errors = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg);
    errors++;
  }
}

assert(ELEMENTS.length === 118, `Expected 118 elements, got ${ELEMENTS.length}`);

const seenZ = new Set<number>();
const seenSymbols = new Set<string>();
const seenCoords = new Set<string>();

for (const el of ELEMENTS) {
  assert(!seenZ.has(el.z), `Duplicate Z: ${el.z}`);
  seenZ.add(el.z);

  assert(!seenSymbols.has(el.symbol), `Duplicate symbol: ${el.symbol}`);
  seenSymbols.add(el.symbol);

  const coordKey = `${el.gridRow},${el.gridCol}`;
  assert(!seenCoords.has(coordKey), `Duplicate grid coord ${coordKey} on ${el.symbol}`);
  seenCoords.add(coordKey);

  assert(el.gridCol >= 1 && el.gridCol <= 18, `Invalid gridCol ${el.gridCol} on ${el.symbol}`);
  assert(
    (el.gridRow >= 1 && el.gridRow <= 7) || el.gridRow === 9 || el.gridRow === 10,
    `Invalid gridRow ${el.gridRow} on ${el.symbol}`
  );
  assert(el.productionSteps.length === 4, `Expected 4 production steps on ${el.symbol}`);
  assert(el.applications.length >= 1, `Missing applications on ${el.symbol}`);

  const miningSum = el.miningLeaders.reduce((acc, c) => acc + c.share, 0);
  const refiningSum = el.refiningLeaders.reduce((acc, c) => acc + c.share, 0);
  assert(miningSum <= 105, `Mining share sum > 105 (${miningSum}) on ${el.symbol}`);
  assert(refiningSum <= 105, `Refining share sum > 105 (${refiningSum}) on ${el.symbol}`);

  for (const preset of FOUNDER_PRESETS) {
    const scores = computeElementScores(el, preset);
    assert(
      !Number.isNaN(scores.builderScore) && scores.builderScore >= 0 && scores.builderScore <= 100,
      `Invalid builderScore on ${el.symbol} for preset ${preset.id}`
    );
    const sim = runUnitEconomicsSim(el, scores, {
      feedstockStrategy: 'byproduct-tailings',
      purityTier: 'semiconductor-5n',
      costAdvantagePct: 25,
      plantScale: 'modular',
    });
    assert(!Number.isNaN(sim.estimatedRealizedPriceUSD), `NaN sim price on ${el.symbol}`);
    assert(sim.strategicNote.length > 10, `Missing sim strategicNote on ${el.symbol}`);
  }
}

for (let z = 1; z <= 118; z++) {
  assert(seenZ.has(z), `Missing atomic number Z=${z}`);
}

if (errors === 0) {
  console.log('ALL 118 ELEMENTS × 6 FOUNDER PRESETS × SIMULATOR VERIFIED SUCCESSFULLY!');
  for (const preset of FOUNDER_PRESETS) {
    const top5 = ELEMENTS.map((el) => ({
      symbol: el.symbol,
      score: computeElementScores(el, preset).builderScore,
    }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => `${x.symbol}(${x.score})`)
      .join(', ');
    console.log(`  [${preset.id.padEnd(10)}] Top 5: ${top5}`);
  }
} else {
  console.error(`Verification failed with ${errors} error(s).`);
  process.exit(1);
}

