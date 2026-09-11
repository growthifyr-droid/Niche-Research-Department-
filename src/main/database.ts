/**
 * SQLite Database Manager for Niche Research Department
 * 
 * CRITICAL DATA SAFETY RULE:
 * All database and application user data files are STRICTLY stored in app.getPath('userData')
 * NEVER in the application installation directory.
 * When the app auto-updates via electron-updater, installation files are replaced,
 * but app.getPath('userData') remains 100% untouched, ensuring ZERO DATA LOSS.
 */

import { app } from 'electron';
import * as path from 'path';
import type { AppSettings, SystemStats } from '../types/electron';
import { getDatabase, getRepositories, getStoragePaths, AppRepositories } from './db/connection';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: any = null;
  private repositories!: AppRepositories;

  private defaultSettings: AppSettings = {
    theme: 'dark',
    reportLanguage: 'en',
    geminiApiKey: '',
    whiteLabelBrand: 'Niche Research Dept.',
    whiteLabelLogo: '',
    autoApprove: false
  };

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initDatabase(): void {
    try {
      this.db = getDatabase();
      this.repositories = getRepositories();
      console.log('[DatabaseManager] Database initialized with complete Day 1 schema & repositories.');
      
      // Ensure default settings exist in Setting table
      for (const [key, value] of Object.entries(this.defaultSettings)) {
        const existing = this.repositories.settings.get(key);
        if (existing === null || existing === undefined) {
          this.repositories.settings.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    } catch (err) {
      console.error('[DatabaseManager] Error during database initialization:', err);
    }
  }

  public getRepositories(): AppRepositories {
    return this.repositories;
  }

  public getSettings(): AppSettings {
    const settings: AppSettings = { ...this.defaultSettings };

    try {
      const allSettings = this.repositories.settings.getAll();
      if (allSettings.theme) settings.theme = allSettings.theme as any;
      if (allSettings.reportLanguage) settings.reportLanguage = allSettings.reportLanguage as any;
      if (allSettings.geminiApiKey) settings.geminiApiKey = allSettings.geminiApiKey;
      if (allSettings.whiteLabelBrand) settings.whiteLabelBrand = allSettings.whiteLabelBrand;
      if (allSettings.whiteLabelLogo) settings.whiteLabelLogo = allSettings.whiteLabelLogo;
      if (allSettings.autoApprove !== undefined) settings.autoApprove = allSettings.autoApprove === 'true';
    } catch (err) {
      console.error('[DatabaseManager] Error fetching settings:', err);
    }

    return settings;
  }

  public saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
    try {
      const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);
      this.repositories.settings.set(String(key), strVal);
      return true;
    } catch (err) {
      console.error(`[DatabaseManager] Failed to save setting ${String(key)}:`, err);
      return false;
    }
  }

  public saveAllSettings(settings: Partial<AppSettings>): boolean {
    try {
      const payload: Record<string, string> = {};
      for (const [k, v] of Object.entries(settings)) {
        if (v !== undefined) {
          payload[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
        }
      }
      this.repositories.settings.setMany(payload);
      return true;
    } catch (err) {
      console.error('[DatabaseManager] Failed to save settings batch:', err);
      return false;
    }
  }

  public getStats(): SystemStats {
    try {
      const totalNiches = this.repositories.niches.getTotalCount();
      const reportsGenerated = this.repositories.reports.getCount();
      const activeRuns = this.repositories.researchRuns.getActiveCount();
      const countriesCovered = this.repositories.countries.getCount();
      const { dbPath } = getStoragePaths();

      return {
        totalNiches,
        reportsGenerated,
        activeRuns,
        countriesCovered,
        dbStatus: 'connected',
        dbPath
      };
    } catch (err) {
      console.error('[DatabaseManager] Error getting stats:', err);
      const { dbPath } = getStoragePaths();
      return {
        totalNiches: 0,
        reportsGenerated: 0,
        activeRuns: 0,
        countriesCovered: 0,
        dbStatus: 'error',
        dbPath
      };
    }
  }

  public getDbPath(): string {
    const { dbPath } = getStoragePaths();
    return dbPath;
  }

  public close(): void {
    if (this.db && typeof this.db.close === 'function') {
      try {
        this.db.close();
        console.log('[DatabaseManager] Database closed cleanly.');
      } catch (err) {
        console.error('[DatabaseManager] Error closing db:', err);
      }
    }
  }
}
