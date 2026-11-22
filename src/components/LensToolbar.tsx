import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { ALL_SECTORS } from '../data';
import { HeatmapLens, Sector } from '../data/types';
import { LENS_METADATA } from '../utils/colorScale';

export interface ActiveFilters {
  criticalOnly: boolean;
  byproductOnly: boolean;
  recyclableOnly: boolean;
  ventureCapexOnly: boolean;
  hideNonCommercial: boolean;
  sector: Sector | 'ALL';
}

interface LensToolbarProps {
  lens: HeatmapLens;
  onChangeLens: (lens: HeatmapLens) => void;
  filters: ActiveFilters;
  onChangeFilters: (next: ActiveFilters) => void;
  showTuner: boolean;
  onToggleTuner: () => void;
  matchCount: number;
  totalCount: number;
  isDark: boolean;
  isCustomProfile: boolean;
}

const LENS_ORDER: HeatmapLens[] = [
  'builder-score',
  'chokepoint',
  'innovation',
  'demand-growth',
  'byproduct',
  'capex-feasibility',
  'family',
];

export function LensToolbar({
  lens,
  onChangeLens,
  filters,
  onChangeFilters,
  showTuner,
  onToggleTuner,
  matchCount,
  totalCount,
  isDark,
  isCustomProfile,
}: LensToolbarProps) {
  const hasAnyFilter =
    filters.criticalOnly ||
    filters.byproductOnly ||
    filters.recyclableOnly ||
    filters.ventureCapexOnly ||
    filters.hideNonCommercial ||
    filters.sector !== 'ALL';

  const resetFilters = () =>
    onChangeFilters({
      criticalOnly: false,
      byproductOnly: false,
      recyclableOnly: false,
      ventureCapexOnly: false,
      hideNonCommercial: false,
      sector: 'ALL',
    });

  const lensMeta = LENS_METADATA[lens];
  const ramp = isDark ? lensMeta.rampColorsDark : lensMeta.rampColorsLight;

  return (
    <section
      aria-label="Heatmap lenses and opportunity filters"
      className="border-b"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="mx-auto max-w-[1640px] px-4 py-2.5 space-y-2.5">
        {/* Row 1: Lens Switcher + Thesis Tuner Button + Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider mr-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Lens
            </span>
            {LENS_ORDER.map((l) => {
              const active = lens === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => onChangeLens(l)}
                  className="rounded border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--accent-primary-soft)' : 'transparent',
                    borderColor: active ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {LENS_METADATA[l].shortLabel}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Compact Color Legend */}
            <div className="hidden xl:flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span>{lensMeta.scaleLabels[0]}</span>
              <div className="flex items-center gap-0.5">
                {ramp.map((c, idx) => (
                  <span
                    key={idx}
                    className="h-3 w-5 rounded-[2px] border"
                    style={{ backgroundColor: c, borderColor: 'var(--border-default)' }}
                  />
                ))}
              </div>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {lensMeta.scaleLabels[2]}
              </span>
            </div>

            {/* Thesis Tuner Toggle */}
            <button
              type="button"
              onClick={onToggleTuner}
              className="flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: showTuner || isCustomProfile ? 'var(--accent-primary-soft)' : 'var(--bg-elevated)',
                borderColor: showTuner || isCustomProfile ? 'var(--accent-primary)' : 'var(--border-strong)',
                color: showTuner || isCustomProfile ? 'var(--accent-primary)' : 'var(--text-primary)',
              }}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Tune Builder Thesis</span>
              {isCustomProfile && (
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Quick Filters + Sector Dropdown + Match Telemetry */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mr-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <Filter className="h-3 w-3" />
              Filters
            </span>

            {[
              { key: 'criticalOnly' as const, label: '◆ Critical Minerals' },
              { key: 'byproductOnly' as const, label: '⑂ Byproduct-Bound' },
              { key: 'recyclableOnly' as const, label: '♻ High Urban-Mining (75+)' },
              { key: 'ventureCapexOnly' as const, label: '⚡ Venture CAPEX (<$25M)' },
              { key: 'hideNonCommercial' as const, label: 'Commercial Only' },
            ].map((chip) => {
              const active = filters[chip.key];
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, [chip.key]: !active })}
                  className="rounded border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--accent-secondary)' : 'var(--bg-elevated)',
                    borderColor: active ? 'var(--accent-secondary)' : 'var(--border-default)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}

            <select
              aria-label="Filter by industrial sector"
              value={filters.sector}
              onChange={(e) =>
                onChangeFilters({ ...filters, sector: e.target.value as Sector | 'ALL' })
              }
              className="rounded border px-2 py-0.5 text-[11px] font-medium cursor-pointer"
              style={{
                backgroundColor: filters.sector !== 'ALL' ? 'var(--accent-primary-soft)' : 'var(--bg-elevated)',
                borderColor: filters.sector !== 'ALL' ? 'var(--accent-primary)' : 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALL">All Sectors</option>
              {ALL_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium cursor-pointer hover:underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span className="hidden lg:inline">{lensMeta.description}</span>
            <span className="font-mono-tabular font-semibold" style={{ color: 'var(--text-primary)' }}>
              {matchCount}/{totalCount} active
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

