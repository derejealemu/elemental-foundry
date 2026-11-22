import { useCallback, useEffect, useMemo, useState } from 'react';
import { ELEMENTS } from './data';
import { computeElementScores, FOUNDER_PRESETS } from './data/scoring';
import { ComputedScores, ElementRecord, FounderProfile, HeatmapLens, WorkspaceView } from './data/types';
import { BottlenecksView } from './components/BottlenecksView';
import { ElementDossier } from './components/ElementDossier';
import { HeaderBar } from './components/HeaderBar';
import { ActiveFilters, LensToolbar } from './components/LensToolbar';
import { OpportunityMatrix } from './components/OpportunityMatrix';
import { PeriodicTableGrid } from './components/PeriodicTableGrid';
import { ShortlistCompare } from './components/ShortlistCompare';
import { ThesisTunerPanel } from './components/ThesisTunerPanel';

export function App() {
  const [isDark, setIsDark] = useState(true);
  const [activeView, setActiveView] = useState<WorkspaceView>('table');
  const [lens, setLens] = useState<HeatmapLens>('builder-score');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTuner, setShowTuner] = useState(false);

  const [profile, setProfile] = useState<FounderProfile>(FOUNDER_PRESETS[0]);
  const [filters, setFilters] = useState<ActiveFilters>({
    criticalOnly: false,
    byproductOnly: false,
    recyclableOnly: false,
    ventureCapexOnly: false,
    hideNonCommercial: false,
    sector: 'ALL',
  });

  const [selectedElement, setSelectedElement] = useState<ElementRecord | null>(null);
  const [hoveredElement, setHoveredElement] = useState<ElementRecord | null>(null);
  const [shortlistIds, setShortlistIds] = useState<Set<number>>(() => new Set([31, 72, 22])); // Pre-seed Ga, Hf, Ti as starter shortlist!

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  // Dynamic scores map recalculated whenever Founder Thesis changes
  const scoresMap = useMemo(() => {
    const map = new Map<number, ComputedScores>();
    for (const el of ELEMENTS) {
      map.set(el.z, computeElementScores(el, profile));
    }
    return map;
  }, [profile]);

  // Search + filter matching across name, symbol, applications, production steps, countries, innovation angles
  const matchedIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const set = new Set<number>();

    for (const el of ELEMENTS) {
      const sc = scoresMap.get(el.z)!;

      if (
        filters.criticalOnly &&
        el.criticalStatus !== 'US & EU Critical' &&
        el.criticalStatus !== 'US Critical' &&
        el.criticalStatus !== 'EU Critical'
      ) {
        continue;
      }
      if (filters.byproductOnly && !el.byproductOf) continue;
      if (filters.recyclableOnly && el.metrics.recyclingPotential < 75) continue;
      if (filters.ventureCapexOnly && el.capexTier !== 'Venture Modular (<$25M)') continue;
      if (filters.hideNonCommercial && !sc.isCommercial) continue;
      if (filters.sector !== 'ALL' && !el.sectors.includes(filters.sector)) continue;

      if (q) {
        const haystack = [
          el.name,
          el.symbol,
          String(el.z),
          el.verdict,
          el.commercialTier,
          el.byproductOf ?? '',
          el.bottleneckNote,
          el.builderSummary,
          el.recommendedWedge,
          ...el.sectors,
          ...el.applications.map((a) => `${a.title} ${a.detail}`),
          ...el.productionSteps.map((p) => p.process),
          ...el.miningLeaders.map((c) => c.country),
          ...el.refiningLeaders.map((c) => c.country),
          ...el.innovationAngles.map((a) => `${a.title} ${a.approach} ${a.summary}`),
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(q)) continue;
      }

      set.add(el.z);
    }

    return set;
  }, [searchQuery, filters, scoresMap]);

  const handleSelectPreset = useCallback((presetId: string) => {
    const found = FOUNDER_PRESETS.find((p) => p.id === presetId);
    if (found) setProfile(found);
  }, []);

  const handleToggleShortlist = useCallback((z: number) => {
    setShortlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(z)) next.delete(z);
      else next.add(z);
      return next;
    });
  }, []);

  const handleLoadSampleShortlist = useCallback(() => {
    setShortlistIds(new Set([31, 72, 3, 22, 70])); // Ga, Hf, Li, Ti, Yb
  }, []);

  const handleStepElement = useCallback(
    (direction: -1 | 1) => {
      if (!selectedElement) return;
      const idx = ELEMENTS.findIndex((e) => e.z === selectedElement.z);
      if (idx === -1) return;
      const nextIdx = (idx + direction + ELEMENTS.length) % ELEMENTS.length;
      setSelectedElement(ELEMENTS[nextIdx]);
    },
    [selectedElement]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderBar
        activeView={activeView}
        onChangeView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeProfile={profile}
        onSelectPreset={handleSelectPreset}
        shortlistCount={shortlistIds.size}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      {(activeView === 'table' || activeView === 'matrix') && (
        <LensToolbar
          lens={lens}
          onChangeLens={setLens}
          filters={filters}
          onChangeFilters={setFilters}
          showTuner={showTuner}
          onToggleTuner={() => setShowTuner((s) => !s)}
          matchCount={matchedIds.size}
          totalCount={ELEMENTS.length}
          isDark={isDark}
          isCustomProfile={profile.id === 'custom'}
        />
      )}

      {showTuner && (activeView === 'table' || activeView === 'matrix') && (
        <ThesisTunerPanel
          profile={profile}
          onChangeProfile={setProfile}
          onSelectPreset={handleSelectPreset}
          onClose={() => setShowTuner(false)}
        />
      )}

      <main className="flex-1">
        {activeView === 'table' && (
          <PeriodicTableGrid
            elements={ELEMENTS}
            scoresMap={scoresMap}
            matchedIds={matchedIds}
            shortlistIds={shortlistIds}
            lens={lens}
            isDark={isDark}
            selectedElement={selectedElement}
            hoveredElement={hoveredElement}
            activeProfile={profile}
            onSelect={setSelectedElement}
            onHover={setHoveredElement}
          />
        )}

        {activeView === 'matrix' && (
          <OpportunityMatrix
            elements={ELEMENTS}
            scoresMap={scoresMap}
            matchedIds={matchedIds}
            onSelect={setSelectedElement}
            isDark={isDark}
          />
        )}

        {activeView === 'bottlenecks' && (
          <BottlenecksView
            elements={ELEMENTS}
            scoresMap={scoresMap}
            onSelect={setSelectedElement}
          />
        )}

        {activeView === 'shortlist' && (
          <ShortlistCompare
            elements={ELEMENTS}
            scoresMap={scoresMap}
            shortlistIds={shortlistIds}
            onToggleShortlist={handleToggleShortlist}
            onLoadSampleShortlist={handleLoadSampleShortlist}
            onSelect={setSelectedElement}
          />
        )}
      </main>

      {selectedElement && (
        <ElementDossier
          element={selectedElement}
          scores={scoresMap.get(selectedElement.z)!}
          isShortlisted={shortlistIds.has(selectedElement.z)}
          onToggleShortlist={handleToggleShortlist}
          onClose={() => setSelectedElement(null)}
          onStep={handleStepElement}
        />
      )}
    </div>
  );
}

export default App;

