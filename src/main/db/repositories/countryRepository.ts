/**
 * Niche Research Department - Country Repository
 * Manages the global country potential database and initial seeding.
 */

import type { CountryRecord, CountryTier } from '../types';
import { SEEDED_COUNTRIES } from '../seeds/countries';

export class CountryRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public getAll(): CountryRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Country
      ORDER BY potentialScore DESC, name ASC
    `);
    return stmt.all() as CountryRecord[];
  }

  public getByCode(code: string): CountryRecord | null {
    const stmt = this.db.prepare('SELECT * FROM Country WHERE countryCode = ?');
    const row = stmt.get(code.toUpperCase()) as CountryRecord | undefined;
    return row || null;
  }

  public getByTier(tier: CountryTier): CountryRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Country
      WHERE tier = ?
      ORDER BY potentialScore DESC
    `);
    return stmt.all(tier) as CountryRecord[];
  }

  public getCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM Country');
    const row = stmt.get() as { count: number };
    return row?.count || 0;
  }

  public seedIfEmpty(): number {
    const count = this.getCount();
    if (count > 0) {
      return count;
    }

    console.log(`[CountryRepository] Seeding ${SEEDED_COUNTRIES.length} countries into SQLite database...`);

    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO Country (
        countryCode, name, flag, internetUsers, ecommerceSpendUSD,
        rpmRangeLow, rpmRangeHigh, affiliateStrength, languageFit,
        potentialScore, tier, createdAt, updatedAt
      ) VALUES (
        @countryCode, @name, @flag, @internetUsers, @ecommerceSpendUSD,
        @rpmRangeLow, @rpmRangeHigh, @affiliateStrength, @languageFit,
        @potentialScore, @tier, datetime('now'), datetime('now')
      )
    `);

    const insertTx = this.db.transaction((countries: typeof SEEDED_COUNTRIES) => {
      for (const c of countries) {
        insertStmt.run(c);
      }
    });

    insertTx(SEEDED_COUNTRIES);
    const newCount = this.getCount();
    console.log(`[CountryRepository] Successfully seeded ${newCount} countries.`);
    return newCount;
  }
}
