import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { PageId } from '../components/layout/Sidebar';
import {
  Compass,
  FileCheck,
  Activity,
  Globe2,
  PlusCircle,
  FileText,
  Settings,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const statCards = [
    {
      id: 'stat-total-niches',
      title: 'Total Niches',
      value: '0',
      subtitle: 'Awaiting first research run',
      icon: Compass,
      color: 'text-sky-400',
      gradient: 'from-sky-500/20 to-transparent'
    },
    {
      id: 'stat-reports-generated',
      title: 'Reports Generated',
      value: '—',
      subtitle: '0 compiled documents',
      icon: FileCheck,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/20 to-transparent'
    },
    {
      id: 'stat-active-runs',
      title: 'Active Runs',
      value: '0',
      subtitle: 'Autonomous agents idle',
      icon: Activity,
      color: 'text-amber-400',
      gradient: 'from-amber-500/20 to-transparent'
    },
    {
      id: 'stat-countries-covered',
      title: 'Countries Covered',
      value: '—',
      subtitle: 'Multi-region indexing',
      icon: Globe2,
      color: 'text-purple-400',
      gradient: 'from-purple-500/20 to-transparent'
    }
  ];

  return (
    <div id="dashboard-page" className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Quick Action Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
              System Command Center
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sparkles className="w-2.5 h-2.5" /> Stage 1: Platform Foundation
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            Research Executive Dashboard
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Foundation skeleton for 35 autonomous AI research agents with safe SQLite persistence.
          </p>
        </div>

        {/* Quick-action buttons */}
        <div className="flex items-center gap-3">
          <button
            id="quick-action-new-research"
            onClick={() => onNavigate('new-research')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Research</span>
          </button>
          <button
            id="quick-action-view-reports"
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileText className="w-4 h-4 text-[var(--text-muted)]" />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <GlassCard
              key={card.id}
              id={card.id}
              hoverEffect
              className="relative overflow-hidden group"
            >
              <div
                className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${card.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold tracking-tight text-[var(--text-main)] font-mono">
                  {card.value}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-dim)]" />
                  <span>{card.subtitle}</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Bottom Row: Recent Activity & Architecture Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Activity Feed Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>Recent Activity Feed</span>
            </h2>
            <span className="text-xs text-[var(--text-dim)]">Real-time event stream</span>
          </div>

          <GlassCard className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] flex items-center justify-center mb-4 text-[var(--text-dim)] shadow-inner">
              <Layers className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              No Research Activity Logged Yet
            </h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mt-1.5 leading-relaxed">
              When autonomous research agents begin indexing trends, market gaps, and regional competition in subsequent updates, their live telemetry and task outputs will stream here.
            </p>
            <button
              onClick={() => onNavigate('new-research')}
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--accent-blue)] hover:underline"
            >
              <span>Initialize first niche research brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </GlassCard>
        </div>

        {/* Right 1 Col: Architecture Blueprint */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>System Blueprint</span>
            </h2>
            <span className="text-xs text-[var(--text-dim)]">Architecture</span>
          </div>

          <GlassCard className="space-y-5 p-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  Zero Data Loss Guarantee
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  SQLite database & research files are isolated in <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">app.getPath('userData')</code>. App updates will never overwrite user data.
                </p>
              </div>
            </div>

            <div className="h-px bg-[var(--border-subtle)]" />

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                  35 Autonomous AI Agents
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Modular slot architecture ready for prompt-by-prompt agent expansion (Scrapers, Analyzers, Synthesizers, Report Compilers).
                </p>
              </div>
            </div>

            <div className="h-px bg-[var(--border-subtle)]" />

            <button
              id="dashboard-configure-system-btn"
              onClick={() => onNavigate('settings')}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] hover:border-[var(--accent-blue)] text-xs font-medium text-[var(--text-main)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[var(--text-dim)]" />
                <span>Configure System & Updates</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-dim)]" />
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
