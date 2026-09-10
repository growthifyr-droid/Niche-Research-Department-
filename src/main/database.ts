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
import * as fs from 'fs';
import type { AppSettings, SystemStats } from '../types/electron';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: any = null;
  private dbPath: string = '';
  private isConnected: boolean = false;
  private fallbackStore: Record<string, string> = {};

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
      // 1. Resolve safe userData directory
      const userDataDir = app.getPath('userData');
      if (!fs.existsSync(userDataDir)) {
        fs.mkdirSync(userDataDir, { recursive: true });
      }

      this.dbPath = path.join(userDataDir, 'niche-research.db');
      console.log(`[DatabaseManager] Initializing SQLite database at safe userData path: ${this.dbPath}`);

      // 2. Load better-sqlite3 dynamically to allow graceful fallback if binary build differs
      let DatabaseConstructor: any;
      try {
        DatabaseConstructor = require('better-sqlite3');
      } catch (requireErr) {
        console.warn('[DatabaseManager] better-sqlite3 native addon not loaded directly; running in structured storage fallback mode:', requireErr);
      }

      if (DatabaseConstructor) {
        this.db = new DatabaseConstructor(this.dbPath, {
          verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
        });

        // Configure optimal connection pragmas for robustness and performance
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        this.db.pragma('busy_timeout = 5000');
        this.db.pragma('synchronous = NORMAL');

        this.initSchema();
        this.isConnected = true;
        console.log('[DatabaseManager] SQLite database connected successfully with WAL mode enabled.');
      } else {
        this.initFallbackStorage(userDataDir);
      }
    } catch (err) {
      console.error('[DatabaseManager] Failed to initialize SQLite database:', err);
      const userDataDir = app.getPath('userData');
      this.initFallbackStorage(userDataDir);
    }
  }

  private initSchema(): void {
    if (!this.db) return;

    // Schema: Settings Key-Value Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      -- Index for rapid settings lookup
      CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
    `);

    // Seed defaults if empty
    const stmt = this.db.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(this.defaultSettings)) {
      stmt.run(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
  }

  private initFallbackStorage(userDataDir: string): void {
    try {
      const fallbackFile = path.join(userDataDir, 'settings-storage.json');
      if (fs.existsSync(fallbackFile)) {
        const content = fs.readFileSync(fallbackFile, 'utf-8');
        this.fallbackStore = JSON.parse(content);
      } else {
        this.fallbackStore = { ...this.defaultSettings } as any;
        fs.writeFileSync(fallbackFile, JSON.stringify(this.fallbackStore, null, 2), 'utf-8');
      }
      this.isConnected = true;
      console.log('[DatabaseManager] Safe fallback storage initialized in userData.');
    } catch (err) {
      console.error('[DatabaseManager] Fallback store init error:', err);
    }
  }

  public getSettings(): AppSettings {
    const settings: AppSettings = { ...this.defaultSettings };

    if (this.db) {
      try {
        const rows = this.db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
        for (const row of rows) {
          if (row.key === 'theme') settings.theme = row.value as any;
          if (row.key === 'reportLanguage') settings.reportLanguage = row.value as any;
          if (row.key === 'geminiApiKey') settings.geminiApiKey = row.value;
          if (row.key === 'whiteLabelBrand') settings.whiteLabelBrand = row.value;
          if (row.key === 'whiteLabelLogo') settings.whiteLabelLogo = row.value;
          if (row.key === 'autoApprove') settings.autoApprove = row.value === 'true';
        }
        return settings;
      } catch (err) {
        console.error('[DatabaseManager] Error querying settings:', err);
      }
    }

    // Fallback store
    return {
      theme: (this.fallbackStore.theme as any) || 'dark',
      reportLanguage: (this.fallbackStore.reportLanguage as any) || 'en',
      geminiApiKey: this.fallbackStore.geminiApiKey || '',
      whiteLabelBrand: this.fallbackStore.whiteLabelBrand || 'Niche Research Dept.',
      whiteLabelLogo: this.fallbackStore.whiteLabelLogo || '',
      autoApprove: String(this.fallbackStore.autoApprove) === 'true'
    };
  }

  public saveSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): boolean {
    const strVal = typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO app_settings (key, value, updated_at) 
          VALUES (?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        `);
        stmt.run(key, strVal);
        return true;
      } catch (err) {
        console.error(`[DatabaseManager] Failed to save setting ${String(key)}:`, err);
        return false;
      }
    }

    try {
      this.fallbackStore[key] = strVal;
      const userDataDir = app.getPath('userData');
      const fallbackFile = path.join(userDataDir, 'settings-storage.json');
      fs.writeFileSync(fallbackFile, JSON.stringify(this.fallbackStore, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error(`[DatabaseManager] Failed to save setting fallback ${String(key)}:`, err);
      return false;
    }
  }

  public saveAllSettings(settings: Partial<AppSettings>): boolean {
    let success = true;
    for (const [k, v] of Object.entries(settings)) {
      if (v !== undefined) {
        const res = this.saveSetting(k as keyof AppSettings, v as any);
        if (!res) success = false;
      }
    }
    return success;
  }

  public getStats(): SystemStats {
    return {
      totalNiches: 0,
      reportsGenerated: 0,
      activeRuns: 0,
      countriesCovered: 0,
      dbStatus: this.isConnected ? 'connected' : 'disconnected',
      dbPath: this.dbPath || path.join(app.getPath('userData'), 'niche-research.db')
    };
  }

  public getDbPath(): string {
    return this.dbPath || path.join(app.getPath('userData'), 'niche-research.db');
  }

  public close(): void {
    if (this.db) {
      try {
        this.db.close();
        console.log('[DatabaseManager] Database closed.');
      } catch (err) {
        console.error('[DatabaseManager] Error closing db:', err);
      }
    }
  }
}
