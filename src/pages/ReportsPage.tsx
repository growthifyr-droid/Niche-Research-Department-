import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { FileText, Download, Filter, Search, Printer, Sparkles, FileSpreadsheet } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div id="reports-page" className="p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
              Document Synthesis
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Arriving in Upcoming Update
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            Generated Research Reports & Dossiers
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Executive white-label dossiers, competitive landscape matrices, and financial projections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-dim)] border border-[var(--border-subtle)] opacity-60 cursor-not-allowed"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
          <button
            disabled
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-dim)] border border-[var(--border-subtle)] opacity-60 cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Batch Export</span>
          </button>
        </div>
      </div>

      {/* Luxury Empty State */}
      <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
          <FileText className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            No Generated Reports Yet
          </h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Autonomous multi-agent research dossiers will appear here once the Agentic Synthesis Engine is deployed in upcoming prompts. Each report will support white-label logos, multi-lingual Urdu/English exports, and full SQLite archival.
          </p>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left">
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-mono text-[var(--accent-blue)] uppercase font-semibold">
              Format 1
            </span>
            <div className="text-xs font-bold text-[var(--text-main)] mt-0.5">Executive PDF Dossier</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-0.5">30-page institutional research</div>
          </div>
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              Format 2
            </span>
            <div className="text-xs font-bold text-[var(--text-main)] mt-0.5">Data Tables & CSV</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-0.5">Keyword & competitor matrix</div>
          </div>
          <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
            <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">
              Format 3
            </span>
            <div className="text-xs font-bold text-[var(--text-main)] mt-0.5">Markdown Brief</div>
            <div className="text-[11px] text-[var(--text-dim)] mt-0.5">Clean AI documentation export</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
