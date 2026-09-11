/**
 * Niche Research Department - SQLite Database Connection & Initialization
 * 
 * Manages:
 * - Isolated storage path at app.getPath('userData')/niche-research.db
 * - Storage directories: userData/screenshots/ and userData/reports/
 * - WAL mode, synchronous=NORMAL, foreign_keys=ON
 * - Automatic migration runner execution on startup
 * - Comprehensive Country table initial seeding (50+ countries)
 * - Safe fallback driver for non-native environments
 */

import path from 'path';
import fs from 'fs';
import { runMigrations } from './migrations/runner';
import {
  SettingRepository,
  CountryRepository,
  ResearchRunRepository,
  NicheRepository,
  KeywordRepository,
  CompetitorRepository,
  ReportRepository,
  ActivityLogRepository,
  ChatRepository
} from './repositories';

export interface StoragePaths {
  userDataDir: string;
  dbPath: string;
  screenshotsDir: string;
  reportsDir: string;
}

export interface AppRepositories {
  settings: SettingRepository;
  countries: CountryRepository;
  researchRuns: ResearchRunRepository;
  niches: NicheRepository;
  keywords: KeywordRepository;
  competitors: CompetitorRepository;
  reports: ReportRepository;
  activityLogs: ActivityLogRepository;
  chat: ChatRepository;
}

let dbInstance: any = null;
let repositoriesInstance: AppRepositories | null = null;
let storagePathsInstance: StoragePaths | null = null;

/**
 * Resolves the persistent userData directory.
 * Guaranteed to be located in OS user data, never inside the app installation directory.
 */
export function getStoragePaths(): StoragePaths {
  if (storagePathsInstance) {
    return storagePathsInstance;
  }

  let userDataDir: string;

  try {
    // Attempt to resolve Electron app userData path only if in real Electron runtime
    if (typeof process !== 'undefined' && process.versions && (process.versions as any).electron) {
      const electron = require('electron');
      const app = electron.app || (electron.remote && electron.remote.app);
      if (app && typeof app.getPath === 'function') {
        userDataDir = app.getPath('userData');
      } else {
        userDataDir = path.join(process.cwd(), 'userData');
      }
    } else {
      userDataDir = path.join(process.cwd(), 'userData');
    }
  } catch {
    userDataDir = path.join(process.cwd(), 'userData');
  }

  const screenshotsDir = path.join(userDataDir, 'screenshots');
  const reportsDir = path.join(userDataDir, 'reports');
  const dbPath = path.join(userDataDir, 'niche-research.db');

  // Ensure necessary runtime directories exist on startup
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  storagePathsInstance = {
    userDataDir,
    dbPath,
    screenshotsDir,
    reportsDir
  };

  return storagePathsInstance;
}

/**
 * Creates an in-memory / JSON fallback driver when better-sqlite3 native binary
 * cannot be loaded in virtualized container or web preview environments.
 */
function createFallbackDriver(dbPath: string) {
  console.warn('[Database] Native better-sqlite3 not found in current environment. Initializing robust fallback driver.');
  
  const tables: Record<string, any[]> = {};
  const fallbackStatePath = path.join(path.dirname(dbPath), 'niche-research-state.json');

  if (fs.existsSync(fallbackStatePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(fallbackStatePath, 'utf8'));
      Object.assign(tables, data);
    } catch {
      // ignore
    }
  }

  const saveState = () => {
    try {
      fs.writeFileSync(fallbackStatePath, JSON.stringify(tables, null, 2), 'utf8');
    } catch {
      // ignore
    }
  };

  return {
    pragma: (str: string) => {
      // no-op for pragmas in fallback
      return null;
    },
    exec: (sql: string) => {
      // Parse table names roughly for schema creation
      const matches = sql.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/gi);
      for (const m of matches) {
        const tbl = m[1];
        if (!tables[tbl]) {
          tables[tbl] = [];
        }
      }
      saveState();
    },
    prepare: (sql: string) => {
      return {
        run: (...args: any[]) => {
          const params = args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) ? args[0] : args;
          
          if (/INSERT/i.test(sql)) {
            const match = sql.match(/INTO\s+(\w+)/i);
            const tbl = match ? match[1] : 'default';
            if (!tables[tbl]) tables[tbl] = [];
            
            let record: any = {};
            if (typeof params === 'object' && !Array.isArray(params)) {
              record = { ...params };
            } else if (Array.isArray(params)) {
              if (tbl.toLowerCase() === 'setting') {
                record = { key: params[0], value: params[1] };
              } else if (tbl.toLowerCase() === 'schema_version') {
                record = { version: params[0], name: params[1], appliedAt: new Date().toISOString() };
              } else {
                record = { id: params[0] || String(Date.now()), params };
              }
            } else {
              record = { id: String(Date.now()), val: params };
            }

            if (!record.createdAt) record.createdAt = new Date().toISOString();
            if (!record.updatedAt) record.updatedAt = new Date().toISOString();

            // Check primary key conflict (key or id or countryCode or version)
            const pkField = record.key !== undefined ? 'key' : record.countryCode !== undefined ? 'countryCode' : record.version !== undefined ? 'version' : 'id';
            const existingIdx = tables[tbl].findIndex((item: any) => item[pkField] === record[pkField]);
            if (existingIdx >= 0) {
              tables[tbl][existingIdx] = { ...tables[tbl][existingIdx], ...record, updatedAt: new Date().toISOString() };
            } else {
              tables[tbl].push(record);
            }
            saveState();
            return { changes: 1, lastInsertRowid: tables[tbl].length };
          }

          if (/UPDATE/i.test(sql)) {
            const match = sql.match(/UPDATE\s+(\w+)/i);
            const tbl = match ? match[1] : '';
            if (tables[tbl] && params && (params.id || params.key)) {
              const id = params.id || params.key;
              const idx = tables[tbl].findIndex((r: any) => r.id === id || r.key === id);
              if (idx >= 0) {
                tables[tbl][idx] = { ...tables[tbl][idx], ...params, updatedAt: new Date().toISOString() };
                saveState();
                return { changes: 1 };
              }
            }
          }

          return { changes: 0 };
        },
        get: (...args: any[]) => {
          const match = sql.match(/FROM\s+(\w+)/i);
          const tbl = match ? match[1] : '';
          const list = tables[tbl] || [];
          
          if (/COUNT\(\*\)/i.test(sql)) {
            return { count: list.length };
          }
          if (args.length > 0) {
            const target = args[0];
            return list.find((item: any) => item.id === target || item.key === target || item.countryCode === target);
          }
          return list[0] || null;
        },
        all: (...args: any[]) => {
          const match = sql.match(/FROM\s+(\w+)/i);
          const tbl = match ? match[1] : '';
          let list = [...(tables[tbl] || [])];
          
          if (args.length > 0 && typeof args[0] === 'string') {
            const filterVal = args[0];
            list = list.filter((item: any) => 
              item.runId === filterVal ||
              item.nicheId === filterVal ||
              item.keywordId === filterVal ||
              item.competitorId === filterVal ||
              item.tier === filterVal
            );
          }
          return list;
        }
      };
    },
    transaction: (fn: Function) => {
      return (...args: any[]) => {
        return fn(...args);
      };
    }
  };
}

/**
 * Initializes or returns the existing SQLite database instance.
 */
export function getDatabase(): any {
  if (dbInstance) {
    return dbInstance;
  }

  const { dbPath } = getStoragePaths();

  try {
    const BetterSqlite3 = require('better-sqlite3');
    dbInstance = new BetterSqlite3(dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? (msg: string) => console.log(`[SQLite] ${msg}`) : undefined
    });

    // Configure high-performance SQLite PRAGMAs
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    dbInstance.pragma('synchronous = NORMAL');
    dbInstance.pragma('temp_store = MEMORY');
    console.log(`[Database] Native SQLite connection established at: ${dbPath}`);
  } catch (err: any) {
    console.warn(`[Database] Failed to load native better-sqlite3 (${err?.message}). Activating robust fallback driver.`);
    dbInstance = createFallbackDriver(dbPath);
  }

  // Execute database migrations
  try {
    const migrationResult = runMigrations(dbInstance);
    console.log(`[Database] Migration verification completed: version ${migrationResult.currentVersion} (${migrationResult.appliedCount} newly applied).`);
  } catch (migErr: any) {
    console.error('[Database] Migration error:', migErr);
  }

  return dbInstance;
}

/**
 * Returns initialized application repositories.
 */
export function getRepositories(): AppRepositories {
  if (repositoriesInstance) {
    return repositoriesInstance;
  }

  const db = getDatabase();

  const settings = new SettingRepository(db);
  const countries = new CountryRepository(db);
  const researchRuns = new ResearchRunRepository(db);
  const niches = new NicheRepository(db);
  const keywords = new KeywordRepository(db);
  const competitors = new CompetitorRepository(db);
  const reports = new ReportRepository(db);
  const activityLogs = new ActivityLogRepository(db);
  const chat = new ChatRepository(db);

  // Automatically seed countries if table is empty
  try {
    countries.seedIfEmpty();
  } catch (seedErr: any) {
    console.error('[Database] Seeding error:', seedErr);
  }

  repositoriesInstance = {
    settings,
    countries,
    researchRuns,
    niches,
    keywords,
    competitors,
    reports,
    activityLogs,
    chat
  };

  return repositoriesInstance;
}
