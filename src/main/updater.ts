/**
 * In-App Auto-Updater Manager for Niche Research Department
 * Powered by electron-updater and GitHub Releases
 * 
 * Rules:
 * 1. Silent automatic check on startup
 * 2. Manual check on demand from Settings
 * 3. Event-driven real-time download progress
 * 4. Quit and Install restarts into new version
 * 5. Zero data loss: replaces application binaries only, keeping app.getPath('userData') safe
 */

import { BrowserWindow, ipcMain } from 'electron';
import { autoUpdater, ProgressInfo, UpdateInfo as ElectronUpdateInfo } from 'electron-updater';
import type { DownloadProgress, UpdateInfo } from '../types/electron';
import { DatabaseManager } from './database';

export class UpdaterManager {
  private static instance: UpdaterManager;
  private mainWindow: BrowserWindow | null = null;
  private isChecking: boolean = false;
  private isDownloading: boolean = false;

  private constructor() {
    this.configureUpdater();
    this.registerIpcHandlers();
  }

  public static getInstance(): UpdaterManager {
    if (!UpdaterManager.instance) {
      UpdaterManager.instance = new UpdaterManager();
    }
    return UpdaterManager.instance;
  }

  public setWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Configure Bearer authorization header if a GitHub token is provided.
   * Required for private repositories where release artifacts are not public.
   */
  public configureAuthHeader(): void {
    let token = (
      process.env.GH_UPDATE_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_TOKEN ||
      ''
    ).trim();

    if (!token) {
      try {
        const db = DatabaseManager.getInstance();
        const savedToken = db.getRepositories()?.settings?.get('ghUpdateToken');
        if (savedToken && savedToken.trim()) {
          token = savedToken.trim();
        }
      } catch (e) {
        // Database not initialized yet
      }
    }

    if (token) {
      console.log('[Updater] Custom GitHub update token detected. Adding authorization header for private repo access...');
      autoUpdater.addAuthHeader(`Bearer ${token}`);
    }
  }

  private configureUpdater(): void {
    // Configure electron-updater
    autoUpdater.autoDownload = false; // User controls when download begins
    autoUpdater.autoInstallOnAppQuit = false; // Prompted restart
    autoUpdater.allowPrerelease = false;

    // Logging
    autoUpdater.logger = console;

    // Set authorization header if private repo token is provided
    this.configureAuthHeader();

    // 1. Checking for update
    autoUpdater.on('checking-for-update', () => {
      this.isChecking = true;
      console.log('[Updater] Checking for updates from GitHub Releases...');
      this.sendToRenderer('updater:checking');
    });

    // 2. Update Available
    autoUpdater.on('update-available', (info: ElectronUpdateInfo) => {
      this.isChecking = false;
      console.log(`[Updater] Update available: v${info.version}`);
      
      const payload: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : undefined
      };

      this.sendToRenderer('updater:available', payload);
    });

    // 3. Update Not Available
    autoUpdater.on('update-not-available', (info: ElectronUpdateInfo) => {
      this.isChecking = false;
      console.log(`[Updater] App is up to date (current: v${info.version})`);
      
      const payload: UpdateInfo = {
        version: info.version
      };

      this.sendToRenderer('updater:not-available', payload);
    });

    // 4. Download Progress (REAL-TIME progress from electron-updater)
    autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
      this.isDownloading = true;
      const progressPayload: DownloadProgress = {
        percent: Math.round(progressObj.percent * 10) / 10,
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total
      };

      this.sendToRenderer('updater:download-progress', progressPayload);
    });

    // 5. Update Downloaded
    autoUpdater.on('update-downloaded', (info: ElectronUpdateInfo) => {
      this.isDownloading = false;
      console.log(`[Updater] Update downloaded successfully: v${info.version}`);
      
      const payload: UpdateInfo = {
        version: info.version,
        releaseDate: info.releaseDate
      };

      this.sendToRenderer('updater:downloaded', payload);
    });

    // 6. Error Handling
    autoUpdater.on('error', (err: Error) => {
      this.isChecking = false;
      this.isDownloading = false;
      console.error('[Updater] Error encountered:', err.message);
      
      this.sendToRenderer('updater:error', {
        message: err.message || 'An unknown network error occurred while contacting update server'
      });
    });
  }

  private registerIpcHandlers(): void {
    // Manual or automatic update check
    ipcMain.handle('updater:check', async (_, manual: boolean) => {
      return this.checkForUpdates(manual);
    });

    // User initiates download
    ipcMain.handle('updater:download', async () => {
      return this.downloadUpdate();
    });

    // User initiates install and restart
    ipcMain.handle('updater:install', () => {
      console.log('[Updater] Quitting and installing update...');
      autoUpdater.quitAndInstall(false, true);
    });
  }

  public async checkForUpdates(manual: boolean = false): Promise<{ checking: boolean }> {
    if (this.isChecking || this.isDownloading) {
      return { checking: false };
    }

    try {
      this.configureAuthHeader();
      this.isChecking = true;
      console.log(`[Updater] Initiating check (manual=${manual})...`);
      await autoUpdater.checkForUpdates();
      return { checking: true };
    } catch (err: any) {
      this.isChecking = false;
      console.error('[Updater] checkForUpdates failed:', err.message);
      if (manual) {
        this.sendToRenderer('updater:error', {
          message: `Update check failed: ${err.message || 'Network unreachable'}`
        });
      }
      return { checking: false };
    }
  }

  public async downloadUpdate(): Promise<{ starting: boolean }> {
    if (this.isDownloading) {
      return { starting: false };
    }

    try {
      this.configureAuthHeader();
      this.isDownloading = true;
      console.log('[Updater] Starting update download...');
      autoUpdater.downloadUpdate();
      return { starting: true };
    } catch (err: any) {
      this.isDownloading = false;
      console.error('[Updater] downloadUpdate failed:', err.message);
      this.sendToRenderer('updater:error', {
        message: `Failed to start update download: ${err.message}`
      });
      return { starting: false };
    }
  }

  private sendToRenderer(channel: string, data?: any): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
}
