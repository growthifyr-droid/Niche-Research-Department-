import React from 'react';
import { useUpdater } from '../../context/UpdaterContext';
import { Download, RefreshCw, X, ArrowUpCircle, Check } from 'lucide-react';

export const UpdateBanner: React.FC = () => {
  const { state, downloadUpdate, installAndRestart, dismissBanner, isBannerVisible } = useUpdater();

  if (!isBannerVisible) return null;
  if (state.status !== 'available' && state.status !== 'downloading' && state.status !== 'downloaded') {
    return null;
  }

  const formatMB = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      id="in-app-update-banner"
      className="w-full px-6 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-xs z-30 transition-all select-none"
      style={{
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderColor: 'rgba(2, 132, 199, 0.25)'
      }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 shrink-0">
          <ArrowUpCircle className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="font-semibold text-[var(--text-main)] flex items-center gap-2">
            <span>Update Available: Version {state.info?.version}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-sky-500/20 text-sky-300 font-mono">
              Release Ready
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
            {state.status === 'downloaded'
              ? 'Update has finished downloading. Restart now to apply changes with zero data loss.'
              : state.status === 'downloading'
              ? `Downloading update package: ${state.progress?.percent || 0}% (${formatMB(
                  state.progress?.transferred
                )} / ${formatMB(state.progress?.total)})`
              : 'A new stable release is ready on GitHub Releases. Click download to fetch it.'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {state.status === 'available' && (
          <button
            id="banner-download-btn"
            onClick={downloadUpdate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--accent-blue)] hover:opacity-90 transition-opacity shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Update</span>
          </button>
        )}

        {state.status === 'downloading' && (
          <div className="flex items-center gap-3 min-w-[160px]">
            <div className="w-24 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${state.progress?.percent || 0}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-sky-400 font-bold">
              {state.progress?.percent || 0}%
            </span>
          </div>
        )}

        {state.status === 'downloaded' && (
          <button
            id="banner-install-btn"
            onClick={installAndRestart}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Install & Restart</span>
          </button>
        )}

        <button
          id="banner-dismiss-btn"
          onClick={dismissBanner}
          title="Dismiss banner (stays visible in sidebar)"
          className="p-1 rounded-md text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
