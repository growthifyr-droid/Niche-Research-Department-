/**
 * Electron Bridge Service
 * 
 * Transparently wraps `window.electronAPI`.
 * When running inside real Electron: calls IPC directly.
 * When running in Web Preview: provides graceful localStorage persistence and updater testing mocks
 * so the app can be developed, tested, and previewed anywhere seamlessly.
 */

import type { AppSettings, DownloadProgress, ElectronAPI, SystemStats, UpdateInfo } from '../types/electron';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  reportLanguage: 'en',
  geminiApiKey: '',
  whiteLabelBrand: 'Niche Research Department',
  whiteLabelLogo: '',
  autoApprove: false
};

class ElectronBridgeService implements ElectronAPI {
  public isElectron: boolean = false;
  private listeners: {
    checking: Array<() => void>;
    available: Array<(info: UpdateInfo) => void>;
    notAvailable: Array<(info: UpdateInfo) => void>;
    progress: Array<(p: DownloadProgress) => void>;
    downloaded: Array<(info: UpdateInfo) => void>;
    error: Array<(err: { message: string }) => void>;
  } = {
    checking: [],
    available: [],
    notAvailable: [],
    progress: [],
    downloaded: [],
    error: []
  };

  private mockDownloadInterval: any = null;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && Boolean(window.electronAPI?.isElectron);
  }

  public async getAppVersion(): Promise<string> {
    if (this.isElectron && window.electronAPI) {
      return window.electronAPI.getAppVersion();
    }
    return '1.0.0';
  }

  public async getPlatform(): Promise<string> {
    if (this.isElectron && window.electronAPI) {
      return window.electronAPI.getPlatform();
    }
    return 'win32';
  }

  public async getUserDataPath(): Promise<string> {
    if (this.isElectron && window.electronAPI) {
      return window.electronAPI.getUserDataPath();
    }
    return 'C:\\Users\\AppData\\Roaming\\niche-research-department';
  }

  public window = {
    minimize: () => {
      if (this.isElectron && window.electronAPI) {
        window.electronAPI.window.minimize();
      } else {
        console.log('[Window] Minimize invoked (web preview)');
      }
    },
    maximize: () => {
      if (this.isElectron && window.electronAPI) {
        window.electronAPI.window.maximize();
      } else {
        console.log('[Window] Maximize invoked (web preview)');
      }
    },
    close: () => {
      if (this.isElectron && window.electronAPI) {
        window.electronAPI.window.close();
      } else {
        console.log('[Window] Close invoked (web preview)');
      }
    },
    isMaximized: async () => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.window.isMaximized();
      }
      return false;
    }
  };

  public database = {
    getSettings: async (): Promise<AppSettings> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.database.getSettings();
      }
      try {
        const stored = localStorage.getItem('nrd_app_settings');
        if (stored) {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
      } catch (e) {
        console.error('Error loading settings from local fallback:', e);
      }
      return { ...DEFAULT_SETTINGS };
    },

    saveSetting: async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<boolean> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.database.saveSetting(key, value);
      }
      try {
        const current = await this.database.getSettings();
        current[key] = value;
        localStorage.setItem('nrd_app_settings', JSON.stringify(current));
        return true;
      } catch (e) {
        console.error('Error saving setting to local fallback:', e);
        return false;
      }
    },

    saveAllSettings: async (settings: Partial<AppSettings>): Promise<boolean> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.database.saveAllSettings(settings);
      }
      try {
        const current = await this.database.getSettings();
        const merged = { ...current, ...settings };
        localStorage.setItem('nrd_app_settings', JSON.stringify(merged));
        return true;
      } catch (e) {
        console.error('Error saving all settings:', e);
        return false;
      }
    },

    getStats: async (): Promise<SystemStats> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.database.getStats();
      }
      return {
        totalNiches: 0,
        reportsGenerated: 0,
        activeRuns: 0,
        countriesCovered: 0,
        dbStatus: 'connected',
        dbPath: 'C:\\Users\\AppData\\Roaming\\niche-research-department\\niche-research.db'
      };
    },

    getDbPath: async (): Promise<string> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.database.getDbPath();
      }
      return 'C:\\Users\\AppData\\Roaming\\niche-research-department\\niche-research.db';
    }
  };

  public updater = {
    checkForUpdates: async (manual?: boolean): Promise<{ checking: boolean }> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.checkForUpdates(manual);
      }

      // Web Simulation for previewing UI states
      console.log(`[Updater Bridge] Checking for updates (web simulator, manual=${manual})...`);
      this.notifyChecking();

      setTimeout(() => {
        // In web preview, by default simulate update available for demonstration if manual check
        if (manual) {
          this.notifyUpdateAvailable({
            version: '1.1.0',
            releaseDate: new Date().toISOString(),
            releaseNotes: 'Performance updates, enhanced SQLite storage layer, and 35 AI agent foundations.'
          });
        } else {
          this.notifyUpdateNotAvailable({ version: '1.0.0' });
        }
      }, 1200);

      return { checking: true };
    },

    downloadUpdate: async (): Promise<{ starting: boolean }> => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.downloadUpdate();
      }

      // Web Simulation for preview
      console.log('[Updater Bridge] Starting simulated download...');
      if (this.mockDownloadInterval) clearInterval(this.mockDownloadInterval);

      let currentPercent = 0;
      const totalBytes = 85 * 1024 * 1024; // 85 MB installer
      const speed = 4.2 * 1024 * 1024; // 4.2 MB/s

      this.mockDownloadInterval = setInterval(() => {
        currentPercent += 8.5;
        if (currentPercent >= 100) {
          currentPercent = 100;
          clearInterval(this.mockDownloadInterval);
          this.notifyProgress({
            percent: 100,
            bytesPerSecond: speed,
            transferred: totalBytes,
            total: totalBytes
          });
          setTimeout(() => {
            this.notifyDownloaded({
              version: '1.1.0',
              releaseDate: new Date().toISOString()
            });
          }, 600);
        } else {
          const transferred = Math.round((currentPercent / 100) * totalBytes);
          this.notifyProgress({
            percent: Math.round(currentPercent * 10) / 10,
            bytesPerSecond: speed,
            transferred,
            total: totalBytes
          });
        }
      }, 400);

      return { starting: true };
    },

    installAndRestart: (): void => {
      if (this.isElectron && window.electronAPI) {
        window.electronAPI.updater.installAndRestart();
      } else {
        alert('[Auto-Updater Simulator] Install & Restart triggered! In Electron, the app replaces binaries and restarts into the new version with zero data loss.');
      }
    },

    onChecking: (callback: () => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onChecking(callback);
      }
      this.listeners.checking.push(callback);
      return () => {
        this.listeners.checking = this.listeners.checking.filter(cb => cb !== callback);
      };
    },

    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onUpdateAvailable(callback);
      }
      this.listeners.available.push(callback);
      return () => {
        this.listeners.available = this.listeners.available.filter(cb => cb !== callback);
      };
    },

    onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onUpdateNotAvailable(callback);
      }
      this.listeners.notAvailable.push(callback);
      return () => {
        this.listeners.notAvailable = this.listeners.notAvailable.filter(cb => cb !== callback);
      };
    },

    onDownloadProgress: (callback: (progress: DownloadProgress) => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onDownloadProgress(callback);
      }
      this.listeners.progress.push(callback);
      return () => {
        this.listeners.progress = this.listeners.progress.filter(cb => cb !== callback);
      };
    },

    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onUpdateDownloaded(callback);
      }
      this.listeners.downloaded.push(callback);
      return () => {
        this.listeners.downloaded = this.listeners.downloaded.filter(cb => cb !== callback);
      };
    },

    onError: (callback: (err: { message: string }) => void) => {
      if (this.isElectron && window.electronAPI) {
        return window.electronAPI.updater.onError(callback);
      }
      this.listeners.error.push(callback);
      return () => {
        this.listeners.error = this.listeners.error.filter(cb => cb !== callback);
      };
    }
  };

  // Internal dispatchers for web simulation
  private notifyChecking() {
    this.listeners.checking.forEach(cb => cb());
  }

  private notifyUpdateAvailable(info: UpdateInfo) {
    this.listeners.available.forEach(cb => cb(info));
  }

  private notifyUpdateNotAvailable(info: UpdateInfo) {
    this.listeners.notAvailable.forEach(cb => cb(info));
  }

  private notifyProgress(progress: DownloadProgress) {
    this.listeners.progress.forEach(cb => cb(progress));
  }

  private notifyDownloaded(info: UpdateInfo) {
    this.listeners.downloaded.forEach(cb => cb(info));
  }

  public simulateError(msg: string) {
    this.listeners.error.forEach(cb => cb({ message: msg }));
  }

  public simulateAvailable(version: string = '1.1.0') {
    this.notifyUpdateAvailable({
      version,
      releaseDate: new Date().toISOString(),
      releaseNotes: 'Major performance optimization, refined UI controls, and agent slot foundations.'
    });
  }
}

export const electronBridge = new ElectronBridgeService();
