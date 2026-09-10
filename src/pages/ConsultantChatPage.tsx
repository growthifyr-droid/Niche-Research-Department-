import React from 'react';
import { GlassCard } from '../components/common/GlassCard';
import { MessageSquare, Bot, Send, Sparkles, User, ShieldCheck } from 'lucide-react';

export const ConsultantChatPage: React.FC = () => {
  return (
    <div id="consultant-chat-page" className="p-8 space-y-6 max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
            Advisory Console
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Arriving in Upcoming Update
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
          Niche Strategy Consultant Chat
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Interactive conversational intelligence over your entire SQLite repository of discovered niches and competitive reports.
        </p>
      </div>

      {/* Simulated Chat Window */}
      <GlassCard className="flex-1 flex flex-col justify-between p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[var(--text-main)]">
                AI Senior Niche Consultant
              </h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Standby for Agentic Integration
              </span>
            </div>
          </div>
          <span className="text-[11px] text-[var(--text-dim)] font-mono">Chat Session #001</span>
        </div>

        {/* Chat Feed Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          <div className="flex items-start gap-3 max-w-lg">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-sm bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)] text-xs text-[var(--text-main)] leading-relaxed space-y-2">
              <p className="font-semibold text-sky-400">
                Welcome to the Niche Research Advisory Interface!
              </p>
              <p className="text-[var(--text-muted)]">
                In upcoming updates, I will analyze your local SQLite market database to answer critical strategic questions:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-dim)] pl-1">
                <li>Which micro-SaaS niche has the lowest customer acquisition friction?</li>
                <li>How can we differentiate against incumbent B2B tools?</li>
                <li>What pricing tiers will maximize MRR without enterprise sales friction?</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disabled Input Field */}
        <div className="pt-3 border-t border-[var(--border-subtle)] shrink-0">
          <div className="relative">
            <input
              type="text"
              disabled
              placeholder="Ask the Niche Consultant anything regarding your research database... (Upcoming feature)"
              className="w-full px-4 py-3 pr-12 rounded-xl border text-xs bg-[var(--input-bg)] opacity-60 cursor-not-allowed text-[var(--text-main)] border-[var(--input-border)]"
            />
            <button
              disabled
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-sky-600/50 text-white cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
