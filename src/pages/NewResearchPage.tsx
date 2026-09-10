import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { Search, Sparkles, SlidersHorizontal, ArrowRight, Bot, Target, Layers, HelpCircle } from 'lucide-react';

export const NewResearchPage: React.FC = () => {
  return (
    <div id="new-research-page" className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
            Agent Dispatcher
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Arriving in Upcoming Update • Prompt 2+
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
          Initiate Autonomous Niche Research
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Configure deep niche parameters, regional market filters, and autonomous agent orchestration objectives.
        </p>
      </div>

      {/* Input Form Placeholder */}
      <GlassCard className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-main)]">
            <Target className="w-4 h-4 text-sky-400" />
            <span>Niche Parameter Specification</span>
          </div>
          <span className="text-xs text-[var(--text-dim)]">Form Interface Skeleton</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
              Core Niche Topic or Problem Space
            </label>
            <div className="relative">
              <input
                type="text"
                disabled
                placeholder="e.g. AI-powered inventory planning for boutique bakeries in the UK"
                className="w-full px-4 py-3 rounded-xl border text-sm bg-[var(--input-bg)] opacity-70 cursor-not-allowed text-[var(--text-main)] border-[var(--input-border)]"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-dim)]" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Target Geography
              </label>
              <select
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[var(--input-bg)] opacity-70 cursor-not-allowed text-[var(--text-main)] border-[var(--input-border)]"
              >
                <option>Global (US, UK, CA, AU, EU)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Monetization Model
              </label>
              <select
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[var(--input-bg)] opacity-70 cursor-not-allowed text-[var(--text-main)] border-[var(--input-border)]"
              >
                <option>B2B Micro-SaaS / Digital Product</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)]">
                Research Depth
              </label>
              <select
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[var(--input-bg)] opacity-70 cursor-not-allowed text-[var(--text-main)] border-[var(--input-border)]"
              >
                <option>Deep Comprehensive (Full 35-Agent Pipeline)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skeleton Agent Dispatch Preview */}
        <div className="p-5 rounded-xl border border-dashed border-[var(--border-strong)] bg-black/5 dark:bg-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
            <Bot className="w-4 h-4 text-sky-400" />
            <span>Upcoming Agentic Execution Pipeline</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            In subsequent prompts, clicking <strong>"Launch Research Swarm"</strong> will instantiate the first batch of specialized agents (Search Query Expander, SERP Crawler, Reddit Trend Extractor, Competitor Moat Inspector, and Revenue Model Synthesizer).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {['SERP Trend Scraper', 'Pain-Point Extractor', 'TAM/SAM Estimator', 'Report Synthesizer'].map(
              (name, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-center text-[11px] font-medium text-[var(--text-muted)]"
                >
                  <span className="block text-[9px] font-mono text-[var(--text-dim)]">Agent {idx + 1}</span>
                  <span className="truncate block mt-0.5">{name}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            disabled
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 opacity-60 cursor-not-allowed shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Research Swarm (Prompt 2+)</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
