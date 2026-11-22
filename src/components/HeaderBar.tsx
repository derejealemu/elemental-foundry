import {
  Atom,
  Bookmark,
  Crosshair,
  GitBranch,
  Grid3X3,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { FOUNDER_PRESETS } from '../data/scoring';
import { FounderProfile, WorkspaceView } from '../data/types';

interface HeaderBarProps {
  activeView: WorkspaceView;
  onChangeView: (view: WorkspaceView) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeProfile: FounderProfile;
  onSelectPreset: (presetId: string) => void;
  shortlistCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function HeaderBar({
  activeView,
  onChangeView,
  searchQuery,
  onSearchChange,
  activeProfile,
  onSelectPreset,
  shortlistCount,
  isDark,
  onToggleTheme,
}: HeaderBarProps) {
  const navItems: { id: WorkspaceView; label: string; icon: typeof Grid3X3; badge?: number }[] = [
    { id: 'table', label: 'Periodic Map', icon: Grid3X3 },
    { id: 'matrix', label: 'Opportunity Matrix', icon: Crosshair },
    { id: 'bottlenecks', label: 'Bottlenecks & Chains', icon: GitBranch },
    { id: 'shortlist', label: 'Shortlist', icon: Bookmark, badge: shortlistCount },
  ];

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md"
      style={{
        backgroundColor: isDark ? 'rgba(11, 14, 19, 0.92)' : 'rgba(245, 244, 239, 0.92)',
        borderColor: 'var(--border-default)',
      }}
    >
      <div className="mx-auto flex max-w-[1640px] flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded border"
            style={{
              backgroundColor: 'var(--accent-primary-soft)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            <Atom className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none">
              ELEMENTAL FOUNDRY
            </h1>
            <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Industrial Periodic Table &amp; Builder Opportunity Mapper
            </p>
          </div>
        </div>

        {/* Workspace View Tabs */}
        <nav aria-label="Workspace views" className="flex items-center gap-1 rounded border p-0.5" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--accent-primary-soft)' : 'transparent',
                  color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="font-mono-tabular rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: isDark ? '#0b0e13' : '#ffffff',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Search + Founder Preset + Theme */}
        <div className="flex flex-1 sm:flex-initial items-center justify-end gap-2">
          {/* Global Search */}
          <div className="relative flex-1 sm:w-64 lg:w-72">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search element, China, DLE, chip, Kroll..."
              aria-label="Search elements by name, application, process, or country"
              className="w-full rounded border py-1.5 pl-8 pr-7 text-xs outline-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: searchQuery ? 'var(--accent-primary)' : 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Founder Playbook Preset Selector */}
          <div className="hidden md:flex items-center gap-1.5">
            <label
              htmlFor="preset-select"
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Thesis
            </label>
            <select
              id="preset-select"
              value={activeProfile.id}
              onChange={(e) => onSelectPreset(e.target.value)}
              className="rounded border px-2 py-1.5 text-xs font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              {FOUNDER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
              {activeProfile.id === 'custom' && (
                <option value="custom">Custom Builder Weights</option>
              )}
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to Lab Ivory Light' : 'Switch to Foundry Dark'}
            className="flex h-8 w-8 items-center justify-center rounded border transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)',
            }}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

