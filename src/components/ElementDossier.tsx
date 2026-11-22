import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Factory,
  FlaskConical,
  Globe2,
  Lightbulb,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { FAMILY_LABELS } from '../data';
import { ComputedScores, CountryShare, ElementRecord } from '../data/types';
import { getVerdictBadgeClasses } from '../utils/colorScale';
import { OpportunitySimulator } from './OpportunitySimulator';

interface ElementDossierProps {
  element: ElementRecord;
  scores: ComputedScores;
  isShortlisted: boolean;
  onToggleShortlist: (z: number) => void;
  onClose: () => void;
  onStep: (direction: -1 | 1) => void;
}

type DossierTab = 'overview' | 'production' | 'opportunity' | 'simulator';

function CountryBarList({ title, leaders, hhi }: { title: string; leaders: CountryShare[]; hhi: number }) {
  const palette = ['#d97706', '#0d9488', '#2563eb', '#64748b', '#94a3b8'];
  const totalListed = leaders.reduce((sum, l) => sum + l.share, 0);
  const rest = Math.max(0, 100 - totalListed);

  if (leaders.length === 0) {
    return (
      <div className="rounded border p-3 text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</div>
        No commercial country-level extraction or refining supply chain exists.
      </div>
    );
  }

  return (
    <div className="rounded border p-3.5 space-y-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold">{title}</span>
        <span
          className="font-mono-tabular text-[11px] px-1.5 py-0.5 rounded border"
          style={{
            backgroundColor: hhi >= 4000 ? 'rgba(239, 68, 68, 0.14)' : 'var(--bg-elevated)',
            borderColor: hhi >= 4000 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-default)',
            color: hhi >= 4000 ? 'var(--accent-danger)' : 'var(--text-secondary)',
          }}
          title="Herfindahl-Hirschman Index (0–10,000; >2,500 = highly concentrated, >5,000 = dominant monopoly)"
        >
          HHI {hhi.toLocaleString()}
        </span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-sm" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        {leaders.map((l, idx) => (
          <div
            key={l.country}
            style={{ width: `${l.share}%`, backgroundColor: palette[idx % palette.length] }}
            title={`${l.country}: ~${l.share}%`}
          />
        ))}
        {rest > 0 && (
          <div
            style={{ width: `${rest}%`, backgroundColor: 'var(--border-strong)' }}
            title={`Rest of World: ~${rest}%`}
          />
        )}
      </div>

      {/* Breakdown rows */}
      <div className="space-y-1">
        {leaders.map((l, idx) => (
          <div key={l.country} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-[2px] shrink-0"
                style={{ backgroundColor: palette[idx % palette.length] }}
              />
              <span>{l.country}</span>
            </div>
            <span className="font-mono-tabular font-semibold">~{l.share}%</span>
          </div>
        ))}
        {rest > 0 && (
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-[2px] shrink-0" style={{ backgroundColor: 'var(--border-strong)' }} />
              <span>Rest of World</span>
            </div>
            <span className="font-mono-tabular">~{rest}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricGaugeRow({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const color = invert
    ? value >= 75
      ? '#ef4444'
      : value >= 50
        ? '#f59e0b'
        : '#22c55e'
    : value >= 75
      ? '#f59e0b'
      : value >= 50
        ? '#14b8a6'
        : '#64748b';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono-tabular font-semibold">{value}/100</span>
      </div>
      <div className="h-2 w-full rounded-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function ElementDossier({
  element,
  scores,
  isShortlisted,
  onToggleShortlist,
  onClose,
  onStep,
}: ElementDossierProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>('overview');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && (e.target as HTMLElement)?.tagName !== 'INPUT') onStep(-1);
      if (e.key === 'ArrowRight' && (e.target as HTMLElement)?.tagName !== 'INPUT') onStep(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onStep]);

  const tabs: { id: DossierTab; label: string; icon: typeof Factory }[] = [
    { id: 'overview', label: 'Uses & Market', icon: FlaskConical },
    { id: 'production', label: 'How & Where', icon: Globe2 },
    { id: 'opportunity', label: 'Builder Thesis', icon: Lightbulb },
    { id: 'simulator', label: 'Economics Sim', icon: Sparkles },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${element.name} industrial opportunity dossier`}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className="relative z-10 flex h-full w-full max-w-3xl flex-col border-l shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderColor: 'var(--border-strong)',
        }}
      >
        {/* Top Header */}
        <div
          className="border-b px-5 py-4"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5 min-w-0">
              {/* Element Badge */}
              <div
                className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded border"
                style={{
                  backgroundColor: 'var(--accent-primary-soft)',
                  borderColor: 'var(--accent-primary)',
                }}
              >
                <span className="font-mono-tabular text-[10px] leading-none" style={{ color: 'var(--text-muted)' }}>
                  {element.z}
                </span>
                <span className="text-2xl font-bold leading-tight" style={{ color: 'var(--accent-primary)' }}>
                  {element.symbol}
                </span>
                <span className="font-mono-tabular text-[9px] leading-none" style={{ color: 'var(--text-muted)' }}>
                  {element.mass}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">{element.name}</h2>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getVerdictBadgeClasses(element.verdict)}`}>
                    {element.verdict}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{FAMILY_LABELS[element.family]}</span>
                  <span>·</span>
                  <span>{element.commercialTier}</span>
                  <span>·</span>
                  <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {element.criticalStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onStep(-1)}
                aria-label="Previous element"
                title="Previous element (←)"
                className="rounded border p-1.5 cursor-pointer"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onStep(1)}
                aria-label="Next element"
                title="Next element (→)"
                className="rounded border p-1.5 cursor-pointer"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleShortlist(element.z)}
                className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-semibold cursor-pointer transition-colors"
                style={{
                  backgroundColor: isShortlisted ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  borderColor: isShortlisted ? 'var(--accent-primary)' : 'var(--border-default)',
                  color: isShortlisted ? '#0b0e13' : 'var(--text-primary)',
                }}
              >
                <Bookmark className="h-3.5 w-3.5" fill={isShortlisted ? 'currentColor' : 'none'} />
                <span>{isShortlisted ? 'Saved' : 'Shortlist'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close element dossier"
                className="rounded border p-1.5 cursor-pointer"
                style={{ borderColor: 'var(--border-default)', color: 'var(--text-secondary)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded border px-2.5 py-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Builder Fit Score
              </span>
              <span className="font-mono-tabular text-base font-bold" style={{ color: 'var(--accent-primary)' }}>
                {scores.isCommercial ? `${scores.builderScore}/100` : 'N/A'}
              </span>
            </div>
            <div className="rounded border px-2.5 py-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Chokepoint Risk
              </span>
              <span className="font-mono-tabular text-base font-bold">
                {scores.isCommercial ? `${scores.chokepointScore}/100` : 'N/A'}
              </span>
            </div>
            <div className="rounded border px-2.5 py-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Market Value
              </span>
              <span className="font-mono-tabular text-sm font-bold truncate block" title={element.marketSizeUSD}>
                {element.marketSizeUSD.split('(')[0].trim()}
              </span>
            </div>
            <div className="rounded border px-2.5 py-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}>
              <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Entry CAPEX Tier
              </span>
              <span className="text-xs font-semibold truncate block mt-0.5" title={element.capexTier}>
                {element.capexTier}
              </span>
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors"
                  style={{
                    backgroundColor: active ? 'var(--accent-primary-soft)' : 'transparent',
                    borderColor: active ? 'var(--accent-primary)' : 'var(--border-default)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* TAB 1: OVERVIEW & COMMERCIAL USES */}
          {activeTab === 'overview' && (
            <>
              {/* Builder Executive Summary */}
              <div
                className="rounded border p-3.5"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--accent-primary)' }}>
                  Founder Bottom Line
                </h3>
                <p className="text-sm leading-relaxed">{element.builderSummary}</p>
              </div>

              {/* Market Snapshot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Global Annual Production
                  </span>
                  <div className="font-mono-tabular text-xs font-semibold mt-1">{element.annualProduction}</div>
                </div>
                <div className="rounded border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Indicative Price Benchmark
                  </span>
                  <div className="font-mono-tabular text-xs font-semibold mt-1">{element.priceRange}</div>
                </div>
                <div className="rounded border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Feedstock Source
                  </span>
                  <div className="text-xs font-semibold mt-1">
                    {element.feedstockType}
                    {element.byproductOf && (
                      <span className="block font-normal mt-0.5" style={{ color: 'var(--accent-primary)' }}>
                        ⑂ Byproduct of: {element.byproductOf}
                      </span>
                    )}
                  </div>
                </div>
                <div className="rounded border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Active Industrial Sectors
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {element.sectors.map((sec) => (
                      <span
                        key={sec}
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium border"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)' }}
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Applications */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  What It Is Useful For — Industrial &amp; Commercial Applications
                </h3>
                {element.applications.map((app, i) => (
                  <div
                    key={i}
                    className="rounded border p-3.5"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">{app.title}</span>
                      {app.share && (
                        <span
                          className="font-mono-tabular text-[11px] font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--accent-secondary)' }}
                        >
                          {app.share}
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {app.detail}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 2: HOW & WHERE PRODUCED */}
          {activeTab === 'production' && (
            <>
              {/* 4-Stage Industrial Value Chain Flow */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Industrial Production Flow (Feedstock → Commercial Product)
                  </h3>
                  <span className="text-[11px] font-medium" style={{ color: 'var(--accent-danger)' }}>
                    ● Highlighted = Core Bottleneck Stage
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {element.productionSteps.map((step, idx) => (
                    <div
                      key={step.stage}
                      className="rounded border p-3 relative"
                      style={{
                        backgroundColor: step.isBottleneck ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-surface)',
                        borderColor: step.isBottleneck ? 'rgba(239, 68, 68, 0.5)' : 'var(--border-default)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono-tabular text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]"
                            style={{
                              backgroundColor: step.isBottleneck ? '#ef4444' : 'var(--bg-elevated)',
                              color: step.isBottleneck ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {idx + 1}
                          </span>
                          {step.stage}
                        </span>
                        {step.isBottleneck && (
                          <span className="text-[10px] font-bold uppercase text-rose-500">
                            Chokepoint
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {step.process}
                      </p>
                      {idx < 3 && (
                        <ArrowRight
                          className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 opacity-30"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottleneck & Environmental Notes */}
              <div className="grid grid-cols-1 gap-3">
                <div
                  className="rounded border p-3.5 flex items-start gap-2.5"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderColor: 'rgba(239, 68, 68, 0.35)',
                  }}
                >
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                  <div className="text-xs leading-relaxed">
                    <strong className="block mb-0.5">Core Supply &amp; Process Bottleneck</strong>
                    <span style={{ color: 'var(--text-primary)' }}>{element.bottleneckNote}</span>
                  </div>
                </div>

                <div
                  className="rounded border p-3.5 flex items-start gap-2.5"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                >
                  <Factory className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--accent-secondary)' }} />
                  <div className="text-xs leading-relaxed">
                    <strong className="block mb-0.5">Energy, Toxicity &amp; ESG Reality</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{element.environmentalFootprint}</span>
                  </div>
                </div>
              </div>

              {/* Upstream vs Midstream Geographic Concentration */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Where It Is Produced — Upstream Extraction vs. Midstream Refining
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CountryBarList
                    title="Upstream Mining / Feedstock Share"
                    leaders={element.miningLeaders}
                    hhi={scores.miningHHI}
                  />
                  <CountryBarList
                    title="Midstream Refining / Processing Share"
                    leaders={element.refiningLeaders}
                    hhi={scores.refiningHHI}
                  />
                </div>
              </div>
            </>
          )}

          {/* TAB 3: BUILDER OPPORTUNITY & INNOVATION */}
          {activeTab === 'opportunity' && (
            <>
              {/* 6-Axis Breakdown */}
              <div className="rounded border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Opportunity Diagnostic Scorecard
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <MetricGaugeRow label="Supply Chokepoint & Pricing Power" value={scores.chokepointScore} />
                  <MetricGaugeRow label="Process Innovation Headroom" value={element.metrics.innovationHeadroom} />
                  <MetricGaugeRow label="5–10 yr Demand Tailwinds" value={element.metrics.demandGrowth} />
                  <MetricGaugeRow label="Unit Economics & Margin Spread" value={element.metrics.marginPotential} />
                  <MetricGaugeRow label="Modular / Venture CAPEX Viability" value={element.metrics.modularFeasibility} />
                  <MetricGaugeRow label="Urban Mining & Secondary Feedstock" value={element.metrics.recyclingPotential} />
                  <MetricGaugeRow label="Regulatory / Toxicity Friction (Lower = Easier)" value={element.metrics.regulatoryFriction} invert />
                </div>
              </div>

              {/* Honest Builder Split: Why Build vs What Kills Startups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded border p-3.5 space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                    Why Build Here
                  </div>
                  <ul className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {element.whyBuild.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold mt-0.5">+</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded border p-3.5 space-y-2" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                    <AlertOctagon className="h-4 w-4" />
                    What Kills Startups Here
                  </div>
                  <ul className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {element.startupKillers.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold mt-0.5">−</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Concrete Novel Innovation Angles */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Novel Extraction, Refining &amp; Commercialization Angles
                </h3>
                {element.innovationAngles.length > 0 ? (
                  element.innovationAngles.map((angle, i) => (
                    <div
                      key={i}
                      className="rounded border p-3.5 space-y-1.5"
                      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)' }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold">{angle.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-default)', color: 'var(--accent-secondary)' }}
                          >
                            {angle.approach}
                          </span>
                          <span
                            className="font-mono-tabular rounded border px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{ backgroundColor: 'var(--accent-primary-soft)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
                          >
                            {angle.trl}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {angle.summary}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded border p-4 text-xs" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}>
                    No viable extraction/refining innovation pathway exists for this element due to physical half-life or regulatory prohibition.
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 4: UNIT ECONOMICS & COMMERCIALIZATION SIMULATOR */}
          {activeTab === 'simulator' && (
            <OpportunitySimulator key={element.z} element={element} scores={scores} />
          )}
        </div>
      </div>
    </div>
  );
}

