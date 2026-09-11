/**
 * Niche Research Department - Setting Repository
 * Key-Value configuration store for API credentials, themes, and white-label branding.
 */

import type { SettingRecord } from '../types';

export class SettingRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public get(key: string): string | null {
    const stmt = this.db.prepare('SELECT value FROM Setting WHERE key = ?');
    const row = stmt.get(key) as { value: string } | undefined;
    return row ? row.value : null;
  }

  public getAll(): Record<string, string> {
    const stmt = this.db.prepare('SELECT key, value FROM Setting');
    const rows = stmt.all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) {
      result[r.key] = r.value;
    }
    return result;
  }

  public set(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO Setting (key, value, updatedAt)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updatedAt = datetime('now')
    `);
    stmt.run(key, value);
  }

  public setMany(settings: Record<string, string>): void {
    const stmt = this.db.prepare(`
      INSERT INTO Setting (key, value, updatedAt)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updatedAt = datetime('now')
    `);

    const tx = this.db.transaction((items: Record<string, string>) => {
      for (const [k, v] of Object.entries(items)) {
        if (v !== undefined && v !== null) {
          stmt.run(k, String(v));
        }
      }
    });

    tx(settings);
  }
}
