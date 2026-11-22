import { useMemo } from 'react';
import { ArrowUpRight, GitBranch, Globe2, ShieldAlert } from 'lucide-react';
import { getByproductHostGroups } from '../data';
import { ComputedScores, ElementRecord } from '../data/types';

interface BottlenecksViewProps {
  elements: ElementRecord[];
  scoresMap: Map<number, ComputedScores>;
  onSelect: (el: ElementRecord) => void;
}

export function BottlenecksView({ elements, scoresMap, onSelect }: BottlenecksViewProps) {
  const byproductGroups = useMemo(() => getByproductHostGroups(), []);

  // Top refining chokepoints
  const topChokepoints = useMemo(() => {
    return elements
      .filter((el) => scoresMap.get(el.z)?.isCommercial && el.refiningLeaders.length > 0)
      .map((el) => {
        const sc = scoresMap.get(el.z)!;
        return { el, sc };
      })
      .sort((a, b) => (b.sc.topRefiner?.share ?? 0) - (a.sc.topRefiner?.share ?? 0))
      .slice(0, 18);
  }, [elements, scoresMap]);

  // Country dominance aggregation (count of commercial elements where country controls >= 40% of refining)
  const countryDominance = useMemo(() => {
    const counts = new Map<string, { dominant50: ElementRecord[]; major30: ElementRecord[] }>();
    for (const el of elements) {
      if (!scoresMap.get(el.z)?.isCommercial) continue;
      for (const leader of el.refiningLeaders) {
        if (leader.share >= 30) {
          const entry = counts.get(leader.country) ?? { dominant50: [], major30: [] };
          if (leader.share >= 50) entry.dominant50.push(el);
          else entry.major30.push(el);
          counts.set(leader.country, entry);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].dominant50.length * 3 + b[1].major30.length - (a[1].dominant50.length * 3 + a[1].major30.length))
      .slice(0, 8);
  }, [elements, scoresMap]);

  return (
    <div className="mx-auto max-w-[1640px] px-4 py-4 space-y-6">
      {/* Section 1: Country Midstream Concentration Summary */}
      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-4 w-4" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-sm font-bold">Global Midstream Refining Concentration by Country</h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Where the world’s chemical conversion, separation, and metal refining are dangerously centralized (elements with ≥50% single-country refining share).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {countryDominance.map(([country, data]) => (
            <div
              key={country}
              className="rounded border p-3.5 space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{country}</span>
                <span className="font-mono-tabular text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}>
                  {data.dominant50.length} &gt;50%
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.dominant50.slice(0, 14).map((el) => (
                  <button
                    key={el.z}
                    type="button"
                    onClick={() => onSelect(el)}
                    className="font-mono-tabular rounded border px-1.5 py-0.5 text-[11px] font-semibold cursor-pointer hover:border-amber-500"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                    title={`${el.name} — Click to zoom`}
                  >
                    {el.symbol}
                  </button>
                ))}
                {data.dominant50.length > 14 && (
                  <span className="text-[11px] self-center" style={{ color: 'var(--text-muted)' }}>
                    +{data.dominant50.length - 14} more
                  </span>
                )}
              </div>
              {data.major30.length > 0 && (
                <div className="text-[11px] pt-1 border-t" style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                  30–49% share: {data.major30.slice(0, 6).map((e) => e.symbol).join(', ')}
                  {data.major30.length > 6 ? ` +${data.major30.length - 6}` : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: Sharpest Mining vs Refining Chokepoints */}
      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <h2 className="text-sm font-bold">Tightest Single-Country Refining Monopolies</h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Notice how upstream mining is often diversified while midstream refining collapses into a single nation—that midstream gap is where modular separation startups win.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {topChokepoints.map(({ el, sc }) => (
            <button
              key={el.z}
              type="button"
              onClick={() => onSelect(el)}
              className="rounded border p-3.5 text-left transition-colors cursor-pointer hover:border-amber-500/70 space-y-2"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      {el.symbol}
                    </span>
                    <span className="text-sm font-bold">{el.name}</span>
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {el.applications[0]?.title}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono-tabular font-bold text-rose-500">
                  <span>{sc.topRefiner?.share}%</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Mining vs Refining visual bars */}
              <div className="space-y-1.5 text-[11px]">
                <div>
                  <div className="flex justify-between mb-0.5" style={{ color: 'var(--text-muted)' }}>
                    <span>Top Miner: {sc.topMiner?.country ?? 'N/A'}</span>
                    <span className="font-mono-tabular">{sc.topMiner?.share ?? 0}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    <div className="h-full bg-teal-500" style={{ width: `${sc.topMiner?.share ?? 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-semibold">Top Refiner: {sc.topRefiner?.country}</span>
                    <span className="font-mono-tabular font-semibold">{sc.topRefiner?.share}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                    <div className="h-full bg-rose-500" style={{ width: `${sc.topRefiner?.share ?? 0}%` }} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Section 3: Byproduct Dependency Tree */}
      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" style={{ color: 'var(--accent-secondary)' }} />
            <h2 className="text-sm font-bold">The Hidden Byproduct Web — Host Metals &amp; Co-Product Gateways</h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Critical tech elements like Gallium, Germanium, Indium, Hafnium, Iridium, and Rhenium are rarely mined standalone. Partnering with host refineries lets startups bypass 10-year mine permitting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {byproductGroups.map((group) => (
            <div
              key={group.host}
              className="rounded border p-4 space-y-3"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{group.host}</span>
                  <span className="font-mono-tabular text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent-secondary)' }}>
                    Host: {group.hostSymbol}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {group.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-default)' }}>
                {group.dependents.map((dep) => {
                  const sc = scoresMap.get(dep.z)!;
                  return (
                    <button
                      key={dep.z}
                      type="button"
                      onClick={() => onSelect(dep)}
                      className="flex items-center gap-1.5 rounded border px-2 py-1 text-xs cursor-pointer transition-colors hover:border-amber-500"
                      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                    >
                      <span className="font-bold">{dep.symbol}</span>
                      <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        {dep.name.split(' ')[0]}
                      </span>
                      <span className="font-mono-tabular text-[10px] font-bold" style={{ color: 'var(--accent-primary)' }}>
                        {sc.builderScore}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

