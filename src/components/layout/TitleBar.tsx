import React, { useState, useEffect } from 'react';
import { electronBridge } from '../../services/electronBridge';
import { useUpdater } from '../../context/UpdaterContext';
import { Minus, Square, Copy, X, Sparkles, Download, ShieldCheck } from 'lucide-react';

interface TitleBarProps {
  onNavigateToSettings?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onNavigateToSettings }) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const { currentVersion, isUpdateAvailable, state, downloadUpdate, installAndRestart } = useUpdater();

  useEffect(() => {
    electronBridge.window.isMaximized().then(setIsMaximized);
  }, []);

  const handleMinimize = () => {
    electronBridge.window.minimize();
  };

  const handleMaximize = async () => {
    electronBridge.window.maximize();
    const max = await electronBridge.window.isMaximized();
    setIsMaximized(max);
  };

  const handleClose = () => {
    electronBridge.window.close();
  };

  return (
    <header
      id="app-titlebar"
      className="titlebar-drag-region h-10 w-full flex items-center justify-between px-3 border-b select-none shrink-0 z-40 transition-colors"
      style={{
        backgroundColor: 'var(--bg-titlebar)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Left: Brand Crest & App Name */}
      <div className="flex items-center gap-2.5 titlebar-no-drag">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 flex items-center justify-center shadow-sm">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-[var(--text-main)] uppercase">
          Niche Research Department
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium text-[var(--text-dim)] bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
          v{currentVersion}
        </span>
      </div>

      {/* Center: System Status & Update Pill */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        {/* Zero Data Loss Verification Pill */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-[var(--text-dim)] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Safe UserData Isolation (Zero Data Loss)</span>
        </div>

        {/* Real-time Update Indicator */}
        {isUpdateAvailable && (
          <button
            id="titlebar-update-badge"
            onClick={() => {
              if (state.status === 'downloaded') {
                installAndRestart();
              } else if (state.status === 'available') {
                downloadUpdate();
              } else if (onNavigateToSettings) {
                onNavigateToSettings();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-500 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer animate-pulse"
          >
            <Download className="w-3 h-3" />
            <span>
              {state.status === 'downloaded'
                ? `Update Ready: Restart v${state.info?.version}`
                : state.status === 'downloading'
                ? `Downloading Update (${state.progress?.percent || 0}%)`
                : `Update Available v${state.info?.version}`}
            </span>
          </button>
        )}
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center titlebar-no-drag -mr-1">
        <button
          id="window-minimize-btn"
          onClick={handleMinimize}
          title="Minimize"
          className="h-8 w-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          id="window-maximize-btn"
          onClick={handleMaximize}
          title={isMaximized ? 'Restore' : 'Maximize'}
          className="h-8 w-9 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded"
        >
          {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
        </button>
        <button
          id="window-close-btn"
          onClick={handleClose}
          title="Close"
          className="h-8 w-9 flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-rose-600 transition-colors rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
