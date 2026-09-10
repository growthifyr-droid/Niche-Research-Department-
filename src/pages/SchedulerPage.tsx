import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { CalendarClock, Clock, PlayCircle, PlusCircle, CheckCircle2, History } from 'lucide-react';

export const SchedulerPage: React.FC = () => {
  return (
    <div id="scheduler-page" className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
              Automation & Crons
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Arriving in Upcoming Update
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            Autonomous Research Scheduler
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Schedule recurring niche exploration sweeps, daily trend delta monitoring, and automated report compilation.
          </p>
        </div>

        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-600/50 opacity-60 cursor-not-allowed shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Scheduled Job</span>
        </button>
      </div>

      {/* Scheduler Empty State */}
      <GlassCard className="p-12 text-center flex flex-col items-center justify-center min-h-[380px] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <CalendarClock className="w-8 h-8 stroke-[1.5]" />
        </div>

        <div className="max-w-md space-y-2">
          <h3 className="text-lg font-bold text-[var(--text-main)]">
            No Automated Tasks Scheduled
          </h3>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            The background daemon scheduling engine will be wired in upcoming prompts. You will be able to dispatch recurring weekly market surveys, monitor competitors' product launches, and trigger unattended report generation runs.
          </p>
        </div>

        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
          <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Cron Research Sweeps</span>
            </div>
            <p className="text-[11px] text-[var(--text-dim)] mt-1">
              Run weekly deep-dives into designated B2B niche verticals.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-black/5 dark:bg-white/5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>SERP Delta Alerts</span>
            </div>
            <p className="text-[11px] text-[var(--text-dim)] mt-1">
              Receive notifications when keyword search volume changes over 25%.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
