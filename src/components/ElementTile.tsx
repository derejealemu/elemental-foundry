import { ComputedScores, ElementRecord, HeatmapLens } from '../data/types';
import { getElementTileStyle } from '../utils/colorScale';

interface ElementTileProps {
  element: ElementRecord;
  scores: ComputedScores;
  lens: HeatmapLens;
  isDark: boolean;
  isMatched: boolean;
  isSelected: boolean;
  isShortlisted: boolean;
  onSelect: (el: ElementRecord) => void;
  onHover: (el: ElementRecord | null) => void;
}

export function ElementTile({
  element,
  scores,
  lens,
  isDark,
  isMatched,
  isSelected,
  isShortlisted,
  onSelect,
  onHover,
}: ElementTileProps) {
  const style = getElementTileStyle(element, scores, lens, isDark);
  const isCritical =
    element.criticalStatus === 'US & EU Critical' ||
    element.criticalStatus === 'US Critical' ||
    element.criticalStatus === 'EU Critical';

  return (
    <button
      type="button"
      onClick={() => onSelect(element)}
      onMouseEnter={() => onHover(element)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(element)}
      aria-label={`${element.name} (${element.symbol}), atomic number ${element.z}, builder score ${scores.builderScore}, ${element.verdict}`}
      style={{
        gridRow: element.gridRow,
        gridColumn: element.gridCol,
        backgroundColor: style.bg,
        borderColor: isSelected ? 'var(--accent-primary)' : style.border,
        color: style.text,
        opacity: isMatched ? 1 : 0.2,
        boxShadow: isSelected ? '0 0 0 2px var(--accent-primary)' : undefined,
      }}
      className="group relative flex flex-col justify-between rounded-[4px] border p-1 text-left transition-all duration-150 cursor-pointer hover:z-10 hover:scale-[1.06] hover:brightness-110 focus-visible:z-10 min-h-[60px] sm:min-h-[66px] select-none overflow-hidden"
    >
      {/* Top row: Atomic Number + Non-color status glyphs */}
      <div className="flex items-start justify-between gap-0.5 leading-none">
        <span
          className="font-mono-tabular text-[10px] font-medium"
          style={{ color: style.muted }}
        >
          {element.z}
        </span>

        <div className="flex items-center gap-0.5 text-[9px] leading-none">
          {isShortlisted && (
            <span title="Shortlisted" aria-hidden="true" className="text-amber-400">
              ★
            </span>
          )}
          {element.byproductOf && scores.isCommercial && (
            <span
              title={`Byproduct of ${element.byproductOf}`}
              aria-hidden="true"
              style={{ color: style.muted }}
            >
              ⑂
            </span>
          )}
          {isCritical && (
            <span
              title={element.criticalStatus}
              aria-hidden="true"
              style={{ color: style.text }}
            >
              ◆
            </span>
          )}
        </div>
      </div>

      {/* Center: Chemical Symbol */}
      <div className="my-auto pt-0.5">
        <div className="text-[15px] sm:text-[17px] font-bold tracking-tight leading-none">
          {element.symbol}
        </div>
        <div
          className="truncate text-[9px] leading-tight mt-0.5"
          style={{ color: style.muted }}
        >
          {element.name.split(' ')[0]}
        </div>
      </div>

      {/* Bottom: Active Lens Metric */}
      <div className="flex items-center justify-between pt-0.5 leading-none">
        <span
          className="font-mono-tabular text-[9px] font-semibold"
          style={{ color: style.muted }}
        >
          {style.metricValue}
        </span>
        {scores.topRefiner && scores.isCommercial && (
          <span
            className="truncate max-w-[34px] text-[8px] font-mono-tabular uppercase opacity-80 hidden xl:inline"
            style={{ color: style.muted }}
            title={`Top refiner: ${scores.topRefiner.country} (${scores.topRefiner.share}%)`}
          >
            {scores.topRefiner.country.slice(0, 3)}
          </span>
        )}
      </div>
    </button>
  );
}

