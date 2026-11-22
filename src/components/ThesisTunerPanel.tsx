import { SlidersHorizontal, X } from 'lucide-react';
import { FOUNDER_PRESETS } from '../data/scoring';
import { FounderProfile } from '../data/types';

interface ThesisTunerPanelProps {
  profile: FounderProfile;
  onChangeProfile: (next: FounderProfile) => void;
  onSelectPreset: (presetId: string) => void;
  onClose: () => void;
}

const SLIDERS: { key: keyof FounderProfile['weights']; label: string; hint: string }[] = [
  { key: 'chokepoint', label: 'Supply Chokepoint / Monopoly', hint: 'Mining + refining HHI risk' },
  { key: 'innovation', label: 'Process Disruption Headroom', hint: 'Dirty/outdated legacy chemistry' },
  { key: 'demandGrowth', label: 'Demand Tailwinds (5–10 yr)', hint: 'AI, EVs, grid, SMRs, oncology' },
  { key: 'marginPotential', label: 'Unit Economics & $/kg Spread', hint: 'Purity upgrade & pricing leverage' },
  { key: 'modularFeasibility', label: 'Modular / Low-CAPEX Fit', hint: 'Skids vs $2B mega-mines' },
  { key: 'recyclingPotential', label: 'Urban Mining & Tailings Wedge', hint: 'E-waste, fab scrap, smelter waste' },
];

export function ThesisTunerPanel({
  profile,
  onChangeProfile,
  onSelectPreset,
  onClose,
}: ThesisTunerPanelProps) {
  const updateWeight = (key: keyof FounderProfile['weights'], value: number) => {
    onChangeProfile({
      ...profile,
      id: 'custom',
      name: 'Custom Builder Weights',
      description: 'Live custom weighting calibrated to your founder constraints.',
      weights: {
        ...profile.weights,
        [key]: value,
      },
    });
  };

  return (
    <div
      className="border-b"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--border-strong)',
      }}
    >
      <div className="mx-auto max-w-[1640px] px-4 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--border-default)' }}>
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-xs font-bold uppercase tracking-wider">
                Builder Opportunity Thesis Calibration
              </h2>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Adjust how the periodic table re-scores all 118 elements based on your founder archetype, technical moat, and CAPEX tolerance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close thesis calibration panel"
            className="rounded border p-1 cursor-pointer"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preset Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider mr-1" style={{ color: 'var(--text-muted)' }}>
            Playbooks:
          </span>
          {FOUNDER_PRESETS.map((preset) => {
            const active = profile.id === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className="rounded border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--accent-primary-soft)' : 'var(--bg-surface)',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-default)',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                {preset.name}
              </button>
            );
          })}
        </div>

        {/* Sliders Grid + CAPEX Controls */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="md:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SLIDERS.map((s) => (
              <div
                key={s.key}
                className="rounded border p-2.5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-default)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`weight-${s.key}`} className="text-xs font-semibold">
                    {s.label}
                  </label>
                  <span
                    className="font-mono-tabular text-xs font-bold"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {profile.weights[s.key]}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 mb-2" style={{ color: 'var(--text-muted)' }}>
                  {s.hint}
                </p>
                <input
                  id={`weight-${s.key}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={profile.weights[s.key]}
                  onChange={(e) => updateWeight(s.key, Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            ))}
          </div>

          {/* CAPEX & Regulatory Constraints */}
          <div
            className="rounded border p-3 flex flex-col justify-between gap-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div>
              <span className="text-xs font-semibold block mb-1.5">CAPEX Appetite</span>
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: 'venture', label: 'Venture (<$25M)' },
                    { id: 'growth', label: 'Growth ($250M)' },
                    { id: 'industrial', label: 'Mega ($1B+)' },
                  ] as const
                ).map((opt) => {
                  const active = profile.capexTolerance === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        onChangeProfile({
                          ...profile,
                          id: 'custom',
                          name: 'Custom Builder Weights',
                          capexTolerance: opt.id,
                        })
                      }
                      className="rounded border px-1.5 py-1.5 text-[11px] font-medium text-center cursor-pointer"
                      style={{
                        backgroundColor: active ? 'var(--accent-primary-soft)' : 'transparent',
                        borderColor: active ? 'var(--accent-primary)' : 'var(--border-default)',
                        color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={profile.penalizeRegulatory}
                onChange={(e) =>
                  onChangeProfile({
                    ...profile,
                    id: 'custom',
                    name: 'Custom Builder Weights',
                    penalizeRegulatory: e.target.checked,
                  })
                }
                className="mt-0.5 accent-amber-500"
              />
              <span style={{ color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Penalize Extreme Toxicity / Nuclear Permitting</strong>
                <span className="block text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Downweights elements with acute radiation/toxicity barriers (uncheck for radiopharma/nuclear builds).
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

