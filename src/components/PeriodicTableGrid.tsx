import { ArrowUpRight, Factory, Flame, Layers, ShieldAlert } from 'lucide-react';
import { ComputedScores, ElementRecord, FounderProfile, HeatmapLens } from '../data/types';
import { getVerdictBadgeClasses } from '../utils/colorScale';
import { ElementTile } from './ElementTile';

interface PeriodicTableGridProps {
  elements: ElementRecord[];
  scoresMap: Map<number, ComputedScores>;
  matchedIds: Set<number>;
  shortlistIds: Set<number>;
  lens: HeatmapLens;
  isDark: boolean;
  selectedElement: ElementRecord | null;
  hoveredElement: ElementRecord | null;
  activeProfile: FounderProfile;
  onSelect: (el: ElementRecord) => void;
  onHover: (el: ElementRecord | null) => void;
}

export function PeriodicTableGrid({
  elements,
  scoresMap,
  matchedIds,
  shortlistIds,
  lens,
  isDark,
  selectedElement,
  hoveredElement,
  activeProfile,
  onSelect,
  onHover,
}: PeriodicTableGridProps) {
  // Compute top 4 opportunities among currently matched elements for the center-top HUD
  const topOpportunities = elements
    .filter((el) => matchedIds.has(el.z) && scoresMap.get(el.z)?.isCommercial)
    .sort((a, b) => {
      const sa = scoresMap.get(a.z)!;
      const sb = scoresMap.get(b.z)!;
      if (lens === 'chokepoint') return sb.chokepointScore - sa.chokepointScore;
      if (lens === 'innovation') return b.metrics.innovationHeadroom - a.metrics.innovationHeadroom;
      if (lens === 'demand-growth') return b.metrics.demandGrowth - a.metrics.demandGrowth;
      if (lens === 'capex-feasibility') return b.metrics.modularFeasibility - a.metrics.modularFeasibility;
      return sb.builderScore - sa.builderScore;
    })
    .slice(0, 4);

  const hudElement = hoveredElement;
  const hudScores = hudElement ? scoresMap.get(hudElement.z) : null;

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-4">
      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-1 sm:gap-1.5 min-w-[1040px]"
          style={{
            gridTemplateColumns: 'repeat(18, minmax(52px, 1fr))',
            gridTemplateRows: 'repeat(7, minmax(64px, auto)) 14px repeat(2, minmax(64px, auto))',
          }}
        >
          {/* Center-Top Telemetry & Opportunity HUD (Rows 1-3, Columns 3-12) */}
          <div
            style={{
              gridRow: '1 / 4',
              gridColumn: '3 / 13',
              backgroundColor: 'var(--bg-surface)',
              borderColor: hudElement ? 'var(--accent-primary)' : 'var(--border-default)',
            }}
            className="rounded border p-3.5 flex flex-col justify-between transition-colors overflow-hidden"
          >
            {hudElement && hudScores ? (
              <div className="h-full flex flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-tabular text-xs font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                        Z={hudElement.z}
                      </span>
                      <h2 className="text-base font-bold tracking-tight truncate">
                        {hudElement.name} ({hudElement.symbol})
                      </h2>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${getVerdictBadgeClasses(hudElement.verdict)}`}>
                        {hudElement.verdict}
                      </span>
                    </div>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {hudElement.builderSummary}
                    </p>
                  </div>

                  {/* Quick Score Box */}
                  <div
                    className="shrink-0 rounded border px-2.5 py-1.5 text-center"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Fit Score
                    </div>
                    <div className="font-mono-tabular text-xl font-bold leading-tight" style={{ color: 'var(--accent-primary)' }}>
                      {hudScores.isCommercial ? hudScores.builderScore : '—'}
                    </div>
                  </div>
                </div>

                {/* Compact Bottom Telemetry Row */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Primary Use
                    </span>
                    <span className="font-medium truncate block" title={hudElement.applications[0]?.title}>
                      {hudElement.applications[0]?.title}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Midstream Chokepoint
                    </span>
                    <span className="font-mono-tabular font-medium truncate block">
                      {hudScores.topRefiner
                        ? `${hudScores.topRefiner.country} (${hudScores.topRefiner.share}%)`
                        : 'Non-Commercial'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      Benchmark Price
                    </span>
                    <span className="font-mono-tabular font-medium truncate block" title={hudElement.priceRange}>
                      {hudElement.priceRange.split('|')[0]}
                    </span>
                  </div>
                  <div className="min-w-0 flex items-end justify-end">
                    <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--accent-primary)' }}>
                      Click tile to zoom dossier
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                      <Flame className="h-3.5 w-3.5" />
                      Top Builder Targets — {activeProfile.name}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      Hover any element for instant supply-chain telemetry, or click to zoom into production routes, bottlenecks &amp; unit-economics simulator.
                    </p>
                  </div>
                  {/* Tile Glyph Legend */}
                  <div
                    className="shrink-0 flex items-center gap-2.5 text-[10px] font-mono-tabular px-2 py-1 rounded border"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
                  >
                    <span title="US/EU Critical Mineral">◆ Critical</span>
                    <span title="Produced as Industrial Byproduct">⑂ Byproduct</span>
                    <span title="Bookmarked to Shortlist">★ Saved</span>
                  </div>
                </div>

                {/* Top 4 Quick-Launch Cards */}
                {topOpportunities.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {topOpportunities.map((el) => {
                      const sc = scoresMap.get(el.z)!;
                      return (
                        <button
                          key={el.z}
                          type="button"
                          onClick={() => onSelect(el)}
                          className="rounded border p-2 text-left transition-colors cursor-pointer hover:border-amber-500/70"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-default)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold">
                              {el.symbol}{' '}
                              <span className="font-normal text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                {el.name.split(' ')[0]}
                              </span>
                            </span>
                            <span className="font-mono-tabular text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                              {sc.builderScore}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                            {sc.topRefiner ? (
                              <>
                                <ShieldAlert className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">
                                  {sc.topRefiner.country} {sc.topRefiner.share}%
                                </span>
                              </>
                            ) : (
                              <>
                                <Factory className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">{el.capexTier}</span>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs py-3 text-center" style={{ color: 'var(--text-muted)' }}>
                    No commercial elements match the current search/filter combination. Try clearing filters above.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lanthanide / Actinide Placeholders in Period 6 & 7 Group 3 */}
          <div
            style={{
              gridRow: 6,
              gridColumn: 3,
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-muted)',
            }}
            className="rounded-[4px] border border-dashed flex flex-col items-center justify-center p-1 text-center select-none"
          >
            <span className="font-mono-tabular text-[10px] font-semibold">57–71</span>
            <span className="text-[9px] leading-tight">La–Lu</span>
          </div>
          <div
            style={{
              gridRow: 7,
              gridColumn: 3,
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-muted)',
            }}
            className="rounded-[4px] border border-dashed flex flex-col items-center justify-center p-1 text-center select-none"
          >
            <span className="font-mono-tabular text-[10px] font-semibold">89–103</span>
            <span className="text-[9px] leading-tight">Ac–Lr</span>
          </div>

          {/* F-block Row Labels */}
          <div
            style={{ gridRow: 9, gridColumn: '1 / 4', color: 'var(--text-muted)' }}
            className="flex items-center justify-end pr-2 gap-1.5 text-[11px] font-semibold"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Lanthanides (REEs)</span>
          </div>
          <div
            style={{ gridRow: 10, gridColumn: '1 / 4', color: 'var(--text-muted)' }}
            className="flex items-center justify-end pr-2 gap-1.5 text-[11px] font-semibold"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Actinides</span>
          </div>

          {/* All 118 Element Tiles */}
          {elements.map((el) => (
            <ElementTile
              key={el.z}
              element={el}
              scores={scoresMap.get(el.z)!}
              lens={lens}
              isDark={isDark}
              isMatched={matchedIds.has(el.z)}
              isSelected={selectedElement?.z === el.z}
              isShortlisted={shortlistIds.has(el.z)}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
        <span>
          Indicative industrial production shares &amp; market benchmarks synthesized from USGS, IEA Critical Minerals, and EU CRM baselines for strategic exploration.
        </span>
        <span className="font-mono-tabular">
          Tip: Use ← / → arrows inside a dossier to step through elements · Esc to close
        </span>
      </div>
    </div>
  );
}

