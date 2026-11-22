import { useMemo, useState } from 'react';
import { ArrowUpRight, Crosshair } from 'lucide-react';
import { ComputedScores, ElementRecord } from '../data/types';
import { getVerdictBadgeClasses } from '../utils/colorScale';

type AxisKey =
  | 'chokepoint'
  | 'innovation'
  | 'demandGrowth'
  | 'modularFeasibility'
  | 'marginPotential'
  | 'recyclingPotential'
  | 'builderScore';

const AXIS_OPTIONS: { id: AxisKey; label: string }[] = [
  { id: 'chokepoint', label: 'Supply Chokepoint Risk (HHI)' },
  { id: 'innovation', label: 'Process Disruption Headroom' },
  { id: 'demandGrowth', label: 'Demand Tailwinds (5–10 yr)' },
  { id: 'modularFeasibility', label: 'Venture Modularity (Low CAPEX)' },
  { id: 'marginPotential', label: 'Margin & Pricing Leverage' },
  { id: 'recyclingPotential', label: 'Urban Mining / Recycling Wedge' },
  { id: 'builderScore', label: 'Composite Builder Score' },
];

function getAxisValue(el: ElementRecord, sc: ComputedScores, key: AxisKey): number {
  switch (key) {
    case 'chokepoint':
      return sc.chokepointScore;
    case 'innovation':
      return el.metrics.innovationHeadroom;
    case 'demandGrowth':
      return el.metrics.demandGrowth;
    case 'modularFeasibility':
      return el.metrics.modularFeasibility;
    case 'marginPotential':
      return el.metrics.marginPotential;
    case 'recyclingPotential':
      return el.metrics.recyclingPotential;
    case 'builderScore':
      return sc.builderScore;
  }
}

interface OpportunityMatrixProps {
  elements: ElementRecord[];
  scoresMap: Map<number, ComputedScores>;
  matchedIds: Set<number>;
  onSelect: (el: ElementRecord) => void;
  isDark: boolean;
}

export function OpportunityMatrix({
  elements,
  scoresMap,
  matchedIds,
  onSelect,
  isDark,
}: OpportunityMatrixProps) {
  const [xAxis, setXAxis] = useState<AxisKey>('chokepoint');
  const [yAxis, setYAxis] = useState<AxisKey>('innovation');
  const [hovered, setHovered] = useState<ElementRecord | null>(null);

  const commercialElements = useMemo(
    () =>
      elements.filter(
        (el) => matchedIds.has(el.z) && scoresMap.get(el.z)?.isCommercial
      ),
    [elements, matchedIds, scoresMap]
  );

  const rankedList = useMemo(
    () =>
      [...commercialElements].sort(
        (a, b) => scoresMap.get(b.z)!.builderScore - scoresMap.get(a.z)!.builderScore
      ),
    [commercialElements, scoresMap]
  );

  // SVG dimensions
  const width = 820;
  const height = 500;
  const pad = { top: 36, right: 32, bottom: 52, left: 58 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const toX = (val: number) => pad.left + (val / 100) * plotW;
  const toY = (val: number) => pad.top + plotH - (val / 100) * plotH;

  const getDotColor = (verdict: ElementRecord['verdict']) => {
    switch (verdict) {
      case 'Prime Venture Target':
        return '#f59e0b';
      case 'Modular Separation / Recycling Play':
        return '#14b8a6';
      case 'High-Margin Niche / Isotope':
        return '#38bdf8';
      case 'Mega-CAPEX Decarbonization':
        return '#22c55e';
      case 'Regulatory / Toxicity Moat':
        return '#f43f5e';
      default:
        return '#94a3b8';
    }
  };

  const xLabel = AXIS_OPTIONS.find((a) => a.id === xAxis)?.label ?? '';
  const yLabel = AXIS_OPTIONS.find((a) => a.id === yAxis)?.label ?? '';

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-4 space-y-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Main Interactive Quadrant Chart */}
        <div
          className="xl:col-span-8 rounded border p-4 space-y-3"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crosshair className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
                <h2 className="text-sm font-bold">2D Builder Opportunity Landscape</h2>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Bubble size scales logarithmically with market size · Click any element node to open its full industrial dossier.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5">
                <span style={{ color: 'var(--text-muted)' }}>X:</span>
                <select
                  value={xAxis}
                  onChange={(e) => setXAxis(e.target.value as AxisKey)}
                  className="rounded border px-2 py-1 text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {AXIS_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Y:</span>
                <select
                  value={yAxis}
                  onChange={(e) => setYAxis(e.target.value as AxisKey)}
                  className="rounded border px-2 py-1 text-xs cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {AXIS_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* SVG Scatter Plot */}
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[640px]"
              role="img"
              aria-label={`Scatter plot of ${yLabel} versus ${xLabel}`}
            >
              {/* Prime Sweet-Spot Top-Right Quadrant Shading */}
              <rect
                x={toX(60)}
                y={toY(100)}
                width={toX(100) - toX(60)}
                height={toY(60) - toY(100)}
                fill={isDark ? 'rgba(245, 158, 11, 0.06)' : 'rgba(217, 119, 6, 0.07)'}
              />

              {/* Grid lines */}
              {[0, 20, 40, 60, 80, 100].map((tick) => (
                <g key={tick}>
                  <line
                    x1={toX(tick)}
                    y1={pad.top}
                    x2={toX(tick)}
                    y2={height - pad.bottom}
                    stroke={isDark ? '#1e2736' : '#e2ded2'}
                    strokeDasharray={tick === 60 ? '4 4' : undefined}
                    strokeWidth={tick === 60 ? 1.5 : 1}
                  />
                  <line
                    x1={pad.left}
                    y1={toY(tick)}
                    x2={width - pad.right}
                    y2={toY(tick)}
                    stroke={isDark ? '#1e2736' : '#e2ded2'}
                    strokeDasharray={tick === 60 ? '4 4' : undefined}
                    strokeWidth={tick === 60 ? 1.5 : 1}
                  />
                  <text
                    x={toX(tick)}
                    y={height - pad.bottom + 18}
                    textAnchor="middle"
                    fill={isDark ? '#7c8ba1' : '#6c7584'}
                    fontSize="11"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {tick}
                  </text>
                  <text
                    x={pad.left - 10}
                    y={toY(tick) + 4}
                    textAnchor="end"
                    fill={isDark ? '#7c8ba1' : '#6c7584'}
                    fontSize="11"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {tick}
                  </text>
                </g>
              ))}

              {/* Quadrant Corner Labels */}
              <text x={toX(98)} y={toY(95)} textAnchor="end" fill="#f59e0b" fontSize="11" fontWeight="700">
                PRIME SWEET SPOT (HIGH X · HIGH Y)
              </text>
              <text x={toX(2)} y={toY(95)} textAnchor="start" fill={isDark ? '#64748b' : '#78808c'} fontSize="10" fontWeight="600">
                PROCESS / DECARBONIZATION PLAYS
              </text>
              <text x={toX(98)} y={toY(4)} textAnchor="end" fill={isDark ? '#64748b' : '#78808c'} fontSize="10" fontWeight="600">
                CONCENTRATED / INCUMBENT MOAT
              </text>
              <text x={toX(2)} y={toY(4)} textAnchor="start" fill={isDark ? '#475569' : '#94a3b8'} fontSize="10" fontWeight="600">
                LOW LEVERAGE / MATURE
              </text>

              {/* Axis Titles */}
              <text
                x={pad.left + plotW / 2}
                y={height - 10}
                textAnchor="middle"
                fill={isDark ? '#b0bccd' : '#48505c'}
                fontSize="12"
                fontWeight="600"
              >
                {xLabel} →
              </text>
              <text
                x={16}
                y={pad.top + plotH / 2}
                textAnchor="middle"
                fill={isDark ? '#b0bccd' : '#48505c'}
                fontSize="12"
                fontWeight="600"
                transform={`rotate(-90, 16, ${pad.top + plotH / 2})`}
              >
                {yLabel} →
              </text>

              {/* Element Nodes */}
              {commercialElements.map((el) => {
                const sc = scoresMap.get(el.z)!;
                // Deterministic subtle micro-offset so coincident peers (e.g. Tb/Dy) stay individually clickable
                const jx = (((el.z * 17) % 9) - 4) * 0.35;
                const jy = (((el.z * 31) % 9) - 4) * 0.35;
                const cx = toX(Math.max(2, Math.min(98, getAxisValue(el, sc, xAxis) + jx)));
                const cy = toY(Math.max(2, Math.min(98, getAxisValue(el, sc, yAxis) + jy)));
                const r = Math.max(8, Math.min(20, 8 + Math.log10(Math.max(0.05, el.marketSizeBillions) * 20 + 1) * 3.2));
                const color = getDotColor(el.verdict);
                const isHov = hovered?.z === el.z;

                return (
                  <g
                    key={el.z}
                    transform={`translate(${cx}, ${cy})`}
                    className="cursor-pointer"
                    onClick={() => onSelect(el)}
                    onMouseEnter={() => setHovered(el)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <circle
                      r={isHov ? r + 3 : r}
                      fill={color}
                      fillOpacity={isHov ? 0.95 : 0.72}
                      stroke={isHov ? '#ffffff' : isDark ? '#0b0e13' : '#ffffff'}
                      strokeWidth={isHov ? 2.5 : 1.2}
                    />
                    <text
                      y={3.5}
                      textAnchor="middle"
                      fill="#0b0e13"
                      fontSize={r >= 13 ? '10' : '9'}
                      fontWeight="700"
                      fontFamily="IBM Plex Sans, sans-serif"
                      pointerEvents="none"
                    >
                      {el.symbol}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend & Hover Telemetry */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[11px]" style={{ borderColor: 'var(--border-default)' }}>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: 'Prime Venture', color: '#f59e0b' },
                { label: 'Modular Separation / Recycling', color: '#14b8a6' },
                { label: 'High-Margin Niche / Isotope', color: '#38bdf8' },
                { label: 'Mega-CAPEX Decarb', color: '#22c55e' },
                { label: 'Regulatory / Toxicity', color: '#f43f5e' },
                { label: 'Incumbent Commodity', color: '#94a3b8' },
              ].map((item) => (
                <span key={item.label} className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>

            {hovered && (
              <div className="font-mono-tabular font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {hovered.name} ({hovered.symbol}) · Fit {scoresMap.get(hovered.z)?.builderScore} · {hovered.marketSizeUSD.split('(')[0]}
              </div>
            )}
          </div>
        </div>

        {/* Right Ranked Opportunity Leaderboard */}
        <div
          className="xl:col-span-4 rounded border flex flex-col overflow-hidden max-h-[640px]"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
        >
          <div className="p-3.5 border-b" style={{ borderColor: 'var(--border-default)' }}>
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Ranked Commercial Opportunities ({rankedList.length})
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sorted live by your active Builder Thesis score
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {rankedList.map((el, idx) => {
              const sc = scoresMap.get(el.z)!;
              return (
                <button
                  key={el.z}
                  type="button"
                  onClick={() => onSelect(el)}
                  onMouseEnter={() => setHovered(el)}
                  onMouseLeave={() => setHovered(null)}
                  className="w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer hover:bg-amber-500/5"
                  style={{ borderColor: 'var(--border-default)' }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono-tabular text-[11px] w-5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{el.symbol}</span>
                        <span className="text-xs truncate">{el.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getVerdictBadgeClasses(el.verdict)}`}>
                          {el.verdict}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-mono-tabular text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {sc.builderScore}
                      </div>
                      <div className="font-mono-tabular text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        HHI {sc.chokepointScore}
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

