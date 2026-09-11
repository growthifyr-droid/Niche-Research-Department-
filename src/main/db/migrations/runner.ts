/**
 * Niche Research Department - Database Migration Runner
 * 
 * Automatically tracks applied migrations in `schema_version`.
 * Future schema updates must strictly pass through this runner as sequential version files.
 */

import { MIGRATION_001_VERSION, MIGRATION_001_NAME, MIGRATION_001_SQL } from './001_initial_schema';

export interface MigrationDefinition {
  version: number;
  name: string;
  sql: string;
}

export const ALL_MIGRATIONS: MigrationDefinition[] = [
  {
    version: MIGRATION_001_VERSION,
    name: MIGRATION_001_NAME,
    sql: MIGRATION_001_SQL
  }
];

export function runMigrations(db: any): { appliedCount: number; currentVersion: number } {
  // 1. Ensure schema_version table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      appliedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Fetch all currently applied migration versions
  const rows = db.prepare('SELECT version FROM schema_version ORDER BY version ASC').all() as { version: number }[];
  const validVersions = rows.map(r => Number(r.version)).filter(v => !isNaN(v));
  const appliedSet = new Set(validVersions);

  let appliedCount = 0;
  let maxVersion = validVersions.length > 0 ? Math.max(...validVersions) : 0;

  // 3. Sequentially execute pending migrations in order
  for (const migration of ALL_MIGRATIONS) {
    if (!appliedSet.has(migration.version)) {
      console.log(`[Migrations] Applying migration ${migration.version}: ${migration.name}...`);
      
      const applyTx = db.transaction(() => {
        db.exec(migration.sql);
        db.prepare('INSERT INTO schema_version (version, name, appliedAt) VALUES (?, ?, datetime(\'now\'))')
          .run(migration.version, migration.name);
      });

      applyTx();
      appliedCount++;
      maxVersion = Math.max(maxVersion, migration.version);
      console.log(`[Migrations] Migration ${migration.version} successfully applied.`);
    }
  }

  return { appliedCount, currentVersion: maxVersion };
}
