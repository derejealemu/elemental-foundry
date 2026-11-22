import { Bookmark, Download, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { ComputedScores, ElementRecord } from '../data/types';
import { getVerdictBadgeClasses } from '../utils/colorScale';

interface ShortlistCompareProps {
  elements: ElementRecord[];
  scoresMap: Map<number, ComputedScores>;
  shortlistIds: Set<number>;
  onToggleShortlist: (z: number) => void;
  onLoadSampleShortlist: () => void;
  onSelect: (el: ElementRecord) => void;
}

export function ShortlistCompare({
  elements,
  scoresMap,
  shortlistIds,
  onToggleShortlist,
  onLoadSampleShortlist,
  onSelect,
}: ShortlistCompareProps) {
  const shortlisted = elements.filter((el) => shortlistIds.has(el.z));

  const exportCSV = () => {
    const header = [
      'Z',
      'Symbol',
      'Name',
      'Verdict',
      'BuilderScore',
      'ChokepointScore',
      'InnovationHeadroom',
      'DemandGrowth',
      'ModularFeasibility',
      'RecyclingPotential',
      'TopRefiner',
      'CapexTier',
      'PriceBenchmark',
      'RecommendedWedge',
    ];
    const rows = shortlisted.map((el) => {
      const sc = scoresMap.get(el.z)!;
      const topRef = sc.topRefiner ? `${sc.topRefiner.country} (${sc.topRefiner.share}%)` : 'None';
      return [
        el.z,
        el.symbol,
        el.name,
        el.verdict,
        sc.builderScore,
        sc.chokepointScore,
        el.metrics.innovationHeadroom,
        el.metrics.demandGrowth,
        el.metrics.modularFeasibility,
        el.metrics.recyclingPotential,
        topRef,
        el.capexTier,
        el.priceRange,
        el.recommendedWedge,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });

    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elemental-foundry-shortlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (shortlisted.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--accent-primary)' }}
        >
          <Bookmark className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold">Your Builder Opportunity Shortlist is Empty</h2>
        <p className="text-xs leading-relaxed max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Click any element on the Periodic Table or Opportunity Matrix and press <strong>Shortlist</strong> to build a side-by-side diligence comparison table you can export to CSV.
        </p>
        <button
          type="button"
          onClick={onLoadSampleShortlist}
          className="inline-flex items-center gap-2 rounded border px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
          style={{
            backgroundColor: 'var(--accent-primary-soft)',
            borderColor: 'var(--accent-primary)',
            color: 'var(--accent-primary)',
          }}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Load Sample Hard-Tech Shortlist (Ga · Hf · Li · Ti · Yb)
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">Side-by-Side Opportunity Diligence Matrix ({shortlisted.length})</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Compare supply chokepoints, process disruption headroom, entry CAPEX, and recommended go-to-market wedges.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold cursor-pointer"
          style={{
            backgroundColor: 'var(--accent-primary-soft)',
            borderColor: 'var(--accent-primary)',
            color: 'var(--accent-primary)',
          }}
        >
          <Download className="h-3.5 w-3.5" />
          Export Diligence CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded border" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
        <table className="w-full text-left border-collapse text-xs min-w-[960px]">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}>
              <th className="p-3 font-semibold w-44" style={{ color: 'var(--text-muted)' }}>Dimension</th>
              {shortlisted.map((el) => (
                <th key={el.z} className="p-3 border-l align-top" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(el)}
                      className="text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-tabular text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>
                          {el.symbol}
                        </span>
                        <span className="text-sm font-bold group-hover:underline">{el.name}</span>
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </div>
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getVerdictBadgeClasses(el.verdict)}`}>
                        {el.verdict}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleShortlist(el.z)}
                      aria-label={`Remove ${el.name} from shortlist`}
                      className="p-1 rounded hover:text-rose-500 cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            <tr>
              <td className="p-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Builder Fit Score</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l font-mono-tabular text-base font-bold" style={{ borderColor: 'var(--border-default)', color: 'var(--accent-primary)' }}>
                  {scoresMap.get(el.z)?.builderScore}/100
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Top Midstream Refiner</td>
              {shortlisted.map((el) => {
                const ref = scoresMap.get(el.z)?.topRefiner;
                return (
                  <td key={el.z} className="p-3 border-l font-mono-tabular" style={{ borderColor: 'var(--border-default)' }}>
                    {ref ? `${ref.country} (~${ref.share}%)` : 'N/A'}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="p-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Market &amp; Benchmark Price</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="font-mono-tabular font-semibold">{el.marketSizeUSD.split('(')[0]}</div>
                  <div className="font-mono-tabular text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {el.priceRange.split('|')[0]}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Entry CAPEX &amp; Feedstock</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l" style={{ borderColor: 'var(--border-default)' }}>
                  <div className="font-semibold">{el.capexTier}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {el.byproductOf ? `⑂ ${el.byproductOf}` : el.feedstockType}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold" style={{ color: 'var(--text-muted)' }}>Key Scores (Disrupt / Demand / Modular / Recycle)</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l font-mono-tabular" style={{ borderColor: 'var(--border-default)' }}>
                  {el.metrics.innovationHeadroom} / {el.metrics.demandGrowth} / {el.metrics.modularFeasibility} / {el.metrics.recyclingPotential}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold align-top" style={{ color: 'var(--text-muted)' }}>Top Innovation Angle</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l align-top" style={{ borderColor: 'var(--border-default)' }}>
                  {el.innovationAngles[0] ? (
                    <>
                      <div className="font-semibold">{el.innovationAngles[0].title}</div>
                      <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {el.innovationAngles[0].summary}
                      </p>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>None</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold align-top" style={{ color: 'var(--text-muted)' }}>Recommended Entry Wedge</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l align-top leading-relaxed" style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}>
                  {el.recommendedWedge}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold align-top" style={{ color: 'var(--text-muted)' }}>Primary Startup Killer</td>
              {shortlisted.map((el) => (
                <td key={el.z} className="p-3 border-l align-top leading-relaxed text-rose-500/90" style={{ borderColor: 'var(--border-default)' }}>
                  {el.startupKillers[0]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

