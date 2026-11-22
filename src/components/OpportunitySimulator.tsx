import { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, TrendingUp } from 'lucide-react';
import { runUnitEconomicsSim, SimulationInputs } from '../data/scoring';
import { ComputedScores, ElementRecord } from '../data/types';
import { formatUSDPrice } from '../utils/colorScale';

interface OpportunitySimulatorProps {
  element: ElementRecord;
  scores: ComputedScores;
}

export function OpportunitySimulator({ element, scores }: OpportunitySimulatorProps) {
  const defaultFeedstock: SimulationInputs['feedstockStrategy'] = element.byproductOf
    ? 'byproduct-tailings'
    : element.metrics.recyclingPotential >= 80
      ? 'urban-recycling'
      : 'primary';

  const defaultPurity: SimulationInputs['purityTier'] = element.sectors.includes('Semiconductors')
    ? 'semiconductor-5n'
    : element.sectors.includes('Energy Storage')
      ? 'battery-chemical'
      : 'industrial';

  const [inputs, setInputs] = useState<SimulationInputs>({
    feedstockStrategy: defaultFeedstock,
    purityTier: defaultPurity,
    costAdvantagePct: 25,
    plantScale: element.capexTier === 'Venture Modular (<$25M)' ? 'modular' : 'pilot',
  });

  const result = runUnitEconomicsSim(element, scores, inputs);

  const signalStyles: Record<typeof result.viabilitySignal, string> = {
    'High Leverage': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/40',
    'Viable with Offtake': 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/40',
    'Capital Heavy': 'bg-orange-500/15 text-orange-600 dark:text-orange-300 border-orange-500/40',
    Unviable: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/40',
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded border p-3.5"
        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Commercialization &amp; Unit-Economics Sandbox
            </h3>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${signalStyles[result.viabilitySignal]}`}>
            {result.viabilitySignal}
          </span>
        </div>

        {/* Interactive Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Feedstock Entry Strategy
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'primary', label: 'Primary Ore' },
                  { id: 'byproduct-tailings', label: 'Byproduct / Tailings' },
                  { id: 'urban-recycling', label: 'Urban / E-Waste' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInputs({ ...inputs, feedstockStrategy: opt.id })}
                  className="rounded border px-1.5 py-1.5 text-[11px] font-medium cursor-pointer text-center"
                  style={{
                    backgroundColor: inputs.feedstockStrategy === opt.id ? 'var(--accent-primary-soft)' : 'var(--bg-surface)',
                    borderColor: inputs.feedstockStrategy === opt.id ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: inputs.feedstockStrategy === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Target Purity / Product Tier
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'industrial', label: 'Industrial (2N–3N)' },
                  { id: 'battery-chemical', label: 'Battery / Chem (4N)' },
                  { id: 'semiconductor-5n', label: 'Chip / Precursor (5N+)' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInputs({ ...inputs, purityTier: opt.id })}
                  className="rounded border px-1.5 py-1.5 text-[11px] font-medium cursor-pointer text-center"
                  style={{
                    backgroundColor: inputs.purityTier === opt.id ? 'var(--accent-primary-soft)' : 'var(--bg-surface)',
                    borderColor: inputs.purityTier === opt.id ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: inputs.purityTier === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
              Initial Facility Scale
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'pilot', label: 'Demo Pilot' },
                  { id: 'modular', label: 'Modular Skid' },
                  { id: 'commercial', label: 'Commercial Plant' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setInputs({ ...inputs, plantScale: opt.id })}
                  className="rounded border px-1.5 py-1.5 text-[11px] font-medium cursor-pointer text-center"
                  style={{
                    backgroundColor: inputs.plantScale === opt.id ? 'var(--accent-primary-soft)' : 'var(--bg-surface)',
                    borderColor: inputs.plantScale === opt.id ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: inputs.plantScale === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="cost-adv-slider" className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Process OPEX / Yield Advantage
              </label>
              <span className="font-mono-tabular text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                +{inputs.costAdvantagePct}%
              </span>
            </div>
            <input
              id="cost-adv-slider"
              type="range"
              min={5}
              max={55}
              step={5}
              value={inputs.costAdvantagePct}
              onChange={(e) => setInputs({ ...inputs, costAdvantagePct: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer mt-1"
            />
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span>5% incremental</span>
              <span>30% step-change</span>
              <span>55% breakthrough</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modeled Output Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Est. Realized $/kg
          </span>
          <span className="font-mono-tabular text-base font-bold mt-0.5 block">
            {formatUSDPrice(result.estimatedRealizedPriceUSD)}
          </span>
          <span className="text-[10px] font-mono-tabular" style={{ color: 'var(--text-muted)' }}>
            {result.purityMultiplier.toFixed(1)}x base spread
          </span>
        </div>

        <div className="rounded border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Indicative Gross Margin
          </span>
          <span className="font-mono-tabular text-base font-bold mt-0.5 block" style={{ color: 'var(--accent-success)' }}>
            {result.grossMarginBand}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            steady-state target
          </span>
        </div>

        <div className="rounded border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            FOAK CAPEX Band
          </span>
          <span className="font-mono-tabular text-base font-bold mt-0.5 block">
            {result.estimatedCapexBand}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            illustrative plant cost
          </span>
        </div>

        <div className="rounded border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
          <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
            Time to First Revenue
          </span>
          <span className="font-mono-tabular text-base font-bold mt-0.5 block">
            {result.timeToRevenueMonths}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            incl. permitting &amp; qual
          </span>
        </div>
      </div>

      {/* Dynamic Strategic Recommendation */}
      <div
        className="rounded border p-3.5 flex items-start gap-2.5"
        style={{
          backgroundColor: 'var(--accent-primary-soft)',
          borderColor: 'var(--accent-primary)',
        }}
      >
        {result.viabilitySignal === 'Unviable' || result.viabilitySignal === 'Capital Heavy' ? (
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-primary)' }} />
        )}
        <div className="text-xs leading-relaxed">
          <strong className="block mb-0.5">Simulated Go-To-Market Diagnosis</strong>
          <span style={{ color: 'var(--text-primary)' }}>{result.strategicNote}</span>
        </div>
      </div>

      {/* Recommended Offtakers & Wedge */}
      <div className="rounded border p-3.5 space-y-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5" style={{ color: 'var(--accent-secondary)' }} />
          Recommended Founder Entry Wedge
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {element.recommendedWedge}
        </p>
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
          <span className="text-[10px] uppercase tracking-wider font-semibold block mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Primary Offtake Buyer Archetypes
          </span>
          <div className="flex flex-wrap gap-1.5">
            {element.typicalOfftakers.map((buyer, idx) => (
              <span
                key={idx}
                className="rounded border px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
              >
                {buyer}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

