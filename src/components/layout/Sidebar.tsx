import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUpdater } from '../../context/UpdaterContext';
import {
  LayoutDashboard,
  Search,
  Compass,
  FileText,
  MessageSquare,
  CalendarClock,
  Settings,
  Sun,
  Moon,
  Database,
  ArrowUpCircle,
  Sparkles
} from 'lucide-react';

export type PageId =
  | 'dashboard'
  | 'new-research'
  | 'niche-module'
  | 'reports'
  | 'consultant-chat'
  | 'scheduler'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onSelectPage: (page: PageId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onSelectPage }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isUpdateAvailable, state, currentVersion } = useUpdater();

  const navItems = [
    { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-research' as PageId, label: 'New Research', icon: Search, badge: 'Agent Input' },
    { id: 'niche-module' as PageId, label: 'Niche Module', icon: Compass },
    { id: 'reports' as PageId, label: 'Reports', icon: FileText },
    { id: 'consultant-chat' as PageId, label: 'Consultant Chat', icon: MessageSquare },
    { id: 'scheduler' as PageId, label: 'Scheduler', icon: CalendarClock },
    { id: 'settings' as PageId, label: 'Settings', icon: Settings, real: true }
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-64 border-r flex flex-col justify-between select-none shrink-0 transition-colors z-30"
      style={{
        backgroundColor: 'var(--bg-sidebar)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Top Header / App Brand */}
      <div>
        <div className="p-5 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-amber-400 p-[1.5px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full rounded-[10px] bg-[#090d16] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[var(--text-main)] leading-none">
                Niche Research
              </div>
              <div className="text-[11px] font-medium tracking-widest text-[var(--text-dim)] uppercase mt-1">
                Department
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onSelectPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-[var(--sidebar-active-text)] font-semibold shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent'
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[var(--accent-blue)]' : 'text-[var(--text-dim)]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.real && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                    Live
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Update Notification Box in Sidebar (Visible at all times if update exists) */}
        {isUpdateAvailable && (
          <div className="px-3 pt-2">
            <div
              id="sidebar-update-alert"
              onClick={() => onSelectPage('settings')}
              className="p-3 rounded-xl border cursor-pointer group transition-all"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                borderColor: 'rgba(245, 158, 11, 0.3)'
              }}
            >
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-amber-500 shrink-0 group-hover:scale-110 transition-transform animate-pulse" />
                <span className="text-xs font-semibold text-amber-500">
                  Update Available v{state.info?.version}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                {state.status === 'downloaded'
                  ? 'Update ready. Click to restart app.'
                  : state.status === 'downloading'
                  ? `Downloading: ${state.progress?.percent || 0}%`
                  : 'A new release is ready. Click to download.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Theme Toggle, SQLite Health & Version */}
      <div className="p-3 border-t space-y-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* SQLite Local DB Safety Indicator */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-[11px]">
          <div className="flex items-center gap-2 text-[var(--text-dim)]">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-medium text-[var(--text-muted)]">SQLite Store</span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
            WAL Active
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors border border-[var(--border-subtle)]"
        >
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] text-[var(--text-dim)] uppercase font-mono">
            {isDark ? 'Obsidian' : 'Slate'}
          </span>
        </button>

        {/* System Version info */}
        <div className="flex items-center justify-between px-2 text-[10px] text-[var(--text-dim)]">
          <span>Electron v44 • React 19</span>
          <span className="font-mono">v{currentVersion}</span>
        </div>
      </div>
    </aside>
  );
};
