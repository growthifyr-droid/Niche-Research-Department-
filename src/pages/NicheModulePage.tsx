import React, { useState } from 'react';
import { GlassCard } from '../components/common/GlassCard';
import {
  Compass,
  Layers,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';

export const NicheModulePage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number>(0);

  const placeholderNiches = [
    {
      id: 1,
      title: 'AI Micro-Inventory for Independent Coffee Roasters',
      category: 'B2B Food & Beverage',
      tam: '$140M',
      difficulty: 'Low-Medium',
      status: 'Ready for Indexing'
    },
    {
      id: 2,
      title: 'Automated Compliance Auditor for Solo Healthcare Clinics',
      category: 'HealthTech Compliance',
      tam: '$420M',
      difficulty: 'Medium',
      status: 'Ready for Indexing'
    },
    {
      id: 3,
      title: 'Local SEO Multi-Location Rank Tracker for Dental Networks',
      category: 'Local Marketing SaaS',
      tam: '$280M',
      difficulty: 'Medium-High',
      status: 'Ready for Indexing'
    }
  ];

  return (
    <div id="niche-module-page" className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
              Repository & Analysis
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Arriving in Upcoming Update
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            Niche Opportunity Directory
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Master list and granular detail view for evaluated niche markets, competitor matrices, and viability scores.
          </p>
        </div>
      </div>

      {/* List + Detail Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[520px]">
        {/* Left List Pane (5 cols) */}
        <GlassCard className="lg:col-span-5 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                Discovered Niches (3 Preview)
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">Indexed in SQLite</span>
            </div>

            <div className="space-y-2 mt-3">
              {placeholderNiches.map((niche, idx) => {
                const isSelected = selectedItem === idx;
                return (
                  <div
                    key={niche.id}
                    onClick={() => setSelectedItem(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[var(--accent-blue)] bg-sky-500/10 shadow-sm'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-black/5 dark:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-[var(--text-main)] leading-snug">
                        {niche.title}
                      </h4>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-[var(--accent-blue)] translate-x-0.5' : 'text-[var(--text-dim)]'
                        }`}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
                      <span className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-medium">
                        {niche.category}
                      </span>
                      <span>TAM: {niche.tam}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-center text-xs text-[var(--text-dim)]">
            Full agentic indexing triggers arrive in upcoming prompt updates.
          </div>
        </GlassCard>

        {/* Right Detail Pane (7 cols) */}
        <GlassCard className="lg:col-span-7 p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent-blue)]">
                  Niche Breakdown & Diagnostic Detail
                </span>
                <h3 className="text-lg font-bold text-[var(--text-main)] mt-1">
                  {placeholderNiches[selectedItem].title}
                </h3>
                <span className="inline-block mt-1 text-xs text-[var(--text-muted)]">
                  Category: {placeholderNiches[selectedItem].category}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 shrink-0">
                Viability: 8.4 / 10
              </span>
            </div>

            {/* Metric preview cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Market TAM</span>
                </div>
                <div className="text-base font-bold text-[var(--text-main)] mt-1">
                  {placeholderNiches[selectedItem].tam}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Search Trend</span>
                </div>
                <div className="text-base font-bold text-sky-400 mt-1">+34% YoY</div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)]">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Competition</span>
                </div>
                <div className="text-base font-bold text-amber-400 mt-1">
                  {placeholderNiches[selectedItem].difficulty}
                </div>
              </div>
            </div>

            {/* Skeleton Section for future agents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-dim)]">
                Agent Deep-Dive Modules (Placeholder)
              </h4>
              <div className="p-4 rounded-xl border border-dashed border-[var(--border-strong)] bg-black/5 dark:bg-white/5 space-y-2 text-xs text-[var(--text-muted)]">
                <p>
                  In future prompts, this pane will render live outputs from:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-dim)] pl-2">
                  <li><strong>Competitor Moat Scraper</strong> (Feature comparison tables & pricing models)</li>
                  <li><strong>Forum Sentiment Analyzer</strong> (Unmet customer complaints from Reddit / Quora)</li>
                  <li><strong>Keyword Opportunity Matrix</strong> (Low-difficulty buyer intent keywords)</li>
                  <li><strong>Executive Summary Generator</strong> (Multi-page exportable PDF / Markdown briefs)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-dim)]">
              Stored safely in local SQLite table
            </span>
            <button
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600/50 cursor-not-allowed"
            >
              Export Detail Report (Upcoming)
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
