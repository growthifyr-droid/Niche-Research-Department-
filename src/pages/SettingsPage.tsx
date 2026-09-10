import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUpdater } from '../context/UpdaterContext';
import { useToast } from '../context/ToastContext';
import { electronBridge } from '../services/electronBridge';
import { GlassCard } from '../components/common/GlassCard';
import type { AppSettings } from '../types/electron';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  Upload,
  Check,
  RotateCw,
  Download,
  AlertCircle,
  Database,
  ShieldCheck,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const {
    currentVersion,
    state: updaterState,
    checkForUpdates,
    downloadUpdate,
    installAndRestart
  } = useUpdater();

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    reportLanguage: 'en',
    geminiApiKey: '',
    whiteLabelBrand: 'Niche Research Department',
    whiteLabelLogo: '',
    autoApprove: false
  });

  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dbPath, setDbPath] = useState<string>('');
  const [userDataPath, setUserDataPath] = useState<string>('');

  // Load initial settings and paths
  useEffect(() => {
    async function loadData() {
      try {
        const loaded = await electronBridge.database.getSettings();
        if (loaded) setSettings(loaded);
        const p = await electronBridge.database.getDbPath();
        setDbPath(p);
        const u = await electronBridge.getUserDataPath();
        setUserDataPath(u);
      } catch (err) {
        console.error('Failed to load settings in page:', err);
      }
    }
    loadData();
  }, []);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await electronBridge.database.saveAllSettings(settings);
      // Synchronize theme
      if (settings.theme !== theme) {
        setTheme(settings.theme);
      }
      showToast({
        title: 'Settings Saved',
        message: 'Application configuration stored securely in SQLite database.',
        type: 'success',
        duration: 4000
      });
    } catch (err: any) {
      showToast({
        title: 'Save Failed',
        message: err.message || 'Could not commit to SQLite database.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSettings(prev => ({ ...prev, whiteLabelLogo: result }));
        showToast({
          title: 'Logo Uploaded',
          message: `${file.name} staged for white-label reports.`,
          type: 'info'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper formatting for MB
  const formatMB = (bytes?: number) => {
    if (!bytes) return '0.0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatSpeed = (bytesPerSec?: number) => {
    if (!bytesPerSec) return '0.0 MB/s';
    return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  return (
    <div id="settings-page" className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-blue)]">
              Core Configuration
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Database className="w-2.5 h-2.5" /> SQLite Synchronized
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-main)] mt-1">
            System Settings & Updates
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Manage local storage credentials, report branding preferences, and in-app automated updates.
          </p>
        </div>

        <button
          id="save-settings-top-btn"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-md shadow-sky-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'Saving to SQLite...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* SECTION 1: IN-APP AUTO-UPDATER */}
      <GlassCard id="settings-updater-card" className="space-y-6 border-l-4 border-l-sky-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[var(--text-main)]">
                Application Version & Auto-Updater
              </h2>
              <span className="px-2 py-0.5 rounded-md font-mono text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                v{currentVersion}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Integrated with GitHub Releases via <code className="font-mono text-[11px]">electron-updater</code>. Updates replace binaries while keeping user data 100% safe.
            </p>
          </div>

          <button
            id="manual-check-updates-btn"
            onClick={() => checkForUpdates(true)}
            disabled={updaterState.status === 'checking' || updaterState.status === 'downloading'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${
                updaterState.status === 'checking' ? 'animate-spin text-sky-400' : ''
              }`}
            />
            <span>
              {updaterState.status === 'checking' ? 'Checking for updates...' : 'Check for Updates'}
            </span>
          </button>
        </div>

        {/* Updater Status Feedback Box */}
        <div
          className="p-4 rounded-xl border transition-all"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          {updaterState.status === 'idle' && (
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Automatic startup update check completed quietly in background.</span>
              <span className="font-mono text-[10px] text-[var(--text-dim)]">
                {updaterState.lastChecked ? `Last checked: ${updaterState.lastChecked}` : 'Up to date'}
              </span>
            </div>
          )}

          {updaterState.status === 'checking' && (
            <div className="flex items-center gap-3 text-xs text-[var(--accent-blue)]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Querying GitHub Releases for new binary tags...</span>
            </div>
          )}

          {updaterState.status === 'not-available' && (
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <Check className="w-4 h-4 shrink-0" />
              <span>
                You are running the latest release (v{currentVersion}). No new updates found.
              </span>
            </div>
          )}

          {updaterState.status === 'available' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>Update Available: Version {updaterState.info?.version}</span>
                </div>
                <button
                  id="start-download-update-btn"
                  onClick={downloadUpdate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Update Now</span>
                </button>
              </div>
              {updaterState.info?.releaseNotes && (
                <p className="text-xs text-[var(--text-muted)] bg-black/5 dark:bg-white/5 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                  {updaterState.info.releaseNotes}
                </p>
              )}
            </div>
          )}

          {updaterState.status === 'downloading' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[var(--text-main)] flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                  <span>Downloading release v{updaterState.info?.version}...</span>
                </span>
                <span className="font-mono text-sky-400 font-bold">
                  {updaterState.progress?.percent || 0}%
                </span>
              </div>

              {/* Real-time Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${updaterState.progress?.percent || 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[var(--text-dim)] font-mono">
                <span>
                  {formatMB(updaterState.progress?.transferred)} / {formatMB(updaterState.progress?.total)}
                </span>
                <span>Speed: {formatSpeed(updaterState.progress?.bytesPerSecond)}</span>
              </div>
            </div>
          )}

          {updaterState.status === 'downloaded' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-semibold">
                <Check className="w-4 h-4" />
                <span>
                  Update v{updaterState.info?.version} downloaded successfully! Ready to install.
                </span>
              </div>
              <button
                id="install-restart-update-btn"
                onClick={installAndRestart}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Install & Restart App</span>
              </button>
            </div>
          )}

          {updaterState.status === 'error' && (
            <div className="flex items-center justify-between gap-2 text-xs text-rose-400">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{updaterState.error || 'Network error checking for updates.'}</span>
              </div>
              <button
                onClick={() => checkForUpdates(true)}
                className="text-xs underline hover:text-white"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Web Preview Testing Simulator controls */}
        {!electronBridge.isElectron && (
          <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/5 text-xs">
            <div className="font-semibold text-sky-400 mb-1.5 flex items-center gap-1.5">
              <span>Preview Simulator Controls (Allows live testing of updater states):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => electronBridge.simulateAvailable('1.1.0')}
                className="px-2.5 py-1 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 font-medium text-[11px] border border-sky-500/30 transition-colors"
              >
                Simulate Update Available
              </button>
              <button
                onClick={() => downloadUpdate()}
                className="px-2.5 py-1 rounded bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 font-medium text-[11px] border border-indigo-500/30 transition-colors"
              >
                Simulate Real-time Download
              </button>
              <button
                onClick={() => electronBridge.simulateError('GitHub rate limit or network unreachable')}
                className="px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-medium text-[11px] border border-rose-500/30 transition-colors"
              >
                Simulate Network Error
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* SECTION 2: APPEARANCE & THEME */}
      <GlassCard className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Theme & Appearance</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Select interface appearance. Theme changes persist across app restarts via SQLite.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Dark Mode Card */}
          <div
            id="theme-option-dark"
            onClick={() => {
              setSettings(prev => ({ ...prev, theme: 'dark' }));
              setTheme('dark');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'border-[var(--accent-blue)] bg-sky-500/10 shadow-sm'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#090e19] border border-sky-500/30 text-sky-400">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-main)]">Obsidian Dark</div>
                <div className="text-xs text-[var(--text-muted)]">Deep charcoal and jewel accents</div>
              </div>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-sky-400" />}
          </div>

          {/* Light Mode Card */}
          <div
            id="theme-option-light"
            onClick={() => {
              setSettings(prev => ({ ...prev, theme: 'light' }));
              setTheme('light');
            }}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'border-[var(--accent-blue)] bg-sky-500/10 shadow-sm'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-100 border border-amber-500/30 text-amber-500">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[var(--text-main)]">Porcelain Light</div>
                <div className="text-xs text-[var(--text-muted)]">Clean crisp high-contrast slate</div>
              </div>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-sky-400" />}
          </div>
        </div>
      </GlassCard>

      {/* SECTION 3: LOCAL REPORT & AI CREDENTIALS */}
      <GlassCard className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)]">Report Language & AI Engine</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Configure default multilingual synthesis and your Gemini API key (stored securely in local SQLite).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Language Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Report Language</span>
            </label>
            <select
              id="report-language-select"
              value={settings.reportLanguage}
              onChange={e => setSettings(prev => ({ ...prev, reportLanguage: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--input-border)] focus:outline-none focus:border-[var(--input-focus)]"
            >
              <option value="en">English (Default Global)</option>
              <option value="ur">Urdu (اردو - Regional Specialist)</option>
            </select>
            <p className="text-[11px] text-[var(--text-dim)]">
              Stored in SQLite for future AI multi-lingual translation & synthesis agents.
            </p>
          </div>

          {/* Gemini API Key Input (Masked) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini API Key</span>
            </label>
            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showApiKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={settings.geminiApiKey}
                onChange={e => setSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border text-sm font-mono bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--input-border)] focus:outline-none focus:border-[var(--input-focus)]"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] hover:text-[var(--text-main)]"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-dim)]">
              Masked and persisted locally in SQLite for future AI research modules.
            </p>
          </div>
        </div>

        {/* Auto-Approve Toggle */}
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-[var(--text-main)]">
              Autonomous Auto-Approve Runs
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Allow future AI agent pipelines to automatically run research without pausing for confirmation prompts.
            </div>
          </div>
          <button
            id="auto-approve-toggle"
            type="button"
            onClick={() => setSettings(prev => ({ ...prev, autoApprove: !prev.autoApprove }))}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.autoApprove ? 'bg-[var(--accent-blue)]' : 'bg-black/20 dark:bg-white/10'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                settings.autoApprove ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </GlassCard>

      {/* SECTION 4: WHITE-LABEL BRANDING */}
      <GlassCard className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-[var(--text-main)]">White-Label Branding</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Customize branding headers, watermark, and corporate logo exported in executive reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Agency / Brand Name</span>
            </label>
            <input
              id="white-label-brand-input"
              type="text"
              value={settings.whiteLabelBrand}
              onChange={e => setSettings(prev => ({ ...prev, whiteLabelBrand: e.target.value }))}
              placeholder="Your Agency Name"
              className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-[var(--input-bg)] text-[var(--text-main)] border-[var(--input-border)] focus:outline-none focus:border-[var(--input-focus)]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-dim)] flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Brand Logo (Upload)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[var(--border-strong)] hover:border-[var(--accent-blue)] cursor-pointer text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Choose Image (PNG/SVG)</span>
                <input
                  id="logo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {settings.whiteLabelLogo && (
                <div className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] p-1 bg-white flex items-center justify-center shrink-0">
                  <img
                    src={settings.whiteLabelLogo}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* SECTION 5: DATA SAFETY & SQLITE PATH AUDIT */}
      <GlassCard className="p-6 space-y-3 bg-black/5 dark:bg-white/5 border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Data Loss Architecture Audit</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          All settings, databases, research snapshots, and report archives reside exclusively inside the operating system user data directory. Installing application updates from GitHub Releases will never modify, overwrite, or delete this folder.
        </p>
        <div className="pt-2 flex flex-col gap-1.5 font-mono text-[11px] text-[var(--text-dim)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Database:</span>
            <span className="truncate bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded select-all">
              {dbPath || 'niche-research.db'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">UserData:</span>
            <span className="truncate bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded select-all">
              {userDataPath || 'UserData directory'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Bottom Save Action */}
      <div className="flex justify-end pt-4">
        <button
          id="save-settings-bottom-btn"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-lg shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          <span>{isSaving ? 'Saving to SQLite...' : 'Save Configuration'}</span>
        </button>
      </div>
    </div>
  );
};
