/**
 * Electron IPC Types and Interfaces for Niche Research Department
 */

export type ThemeMode = 'dark' | 'light';

export interface AppSettings {
  theme: ThemeMode;
  reportLanguage: 'en' | 'ur';
  geminiApiKey: string;
  whiteLabelBrand: string;
  whiteLabelLogo: string;
  autoApprove: boolean;
  updatedAt?: string;
}

export interface SystemStats {
  totalNiches: number;
  reportsGenerated: number;
  activeRuns: number;
  countriesCovered: number;
  dbStatus: 'connected' | 'disconnected' | 'memory' | 'error';
  dbPath: string;
}

export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface UpdaterState {
  status: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  info: UpdateInfo | null;
  progress: DownloadProgress | null;
  error: string | null;
  lastChecked: string | null;
}

export interface ElectronAPI {
  isElectron: boolean;
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  getUserDataPath: () => Promise<string>;
  
  // Window controls
  window: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    isMaximized: () => Promise<boolean>;
  };
  
  // Database / Settings IPC
  database: {
    getSettings: () => Promise<AppSettings>;
    saveSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<boolean>;
    saveAllSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
    getStats: () => Promise<SystemStats>;
    getDbPath: () => Promise<string>;
    getCountries: () => Promise<any[]>;
    getCountry: (code: string) => Promise<any>;
    getResearchRuns: (limit?: number) => Promise<any[]>;
    getNiches: (limit?: number) => Promise<any[]>;
    getReports: (limit?: number) => Promise<any[]>;
    getActivityLogs: (limit?: number, runId?: string) => Promise<any[]>;
  };
  
  // Auto-updater IPC
  updater: {
    checkForUpdates: (manual?: boolean) => Promise<{ checking: boolean }>;
    downloadUpdate: () => Promise<{ starting: boolean }>;
    installAndRestart: () => void;
    
    // Event listeners
    onChecking: (callback: () => void) => () => void;
    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
    onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => () => void;
    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => () => void;
    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
    onError: (callback: (err: { message: string }) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
