/**
 * Niche Research Department - Keyword & SERP Repository
 * Handles deep search terms, search intents, volumes, and SERP positions with strict niche isolation.
 */

import type { KeywordRecord, SerpResultRecord } from '../types';

export class KeywordRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public insertMany(keywords: Omit<KeywordRecord, 'createdAt' | 'updatedAt'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO Keyword (
        id, nicheId, nicheCountryId, keyword, type,
        intent, volumeEstimate, difficulty, cluster,
        localTerm, serpStatus, createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @nicheCountryId, @keyword, @type,
        @intent, @volumeEstimate, @difficulty, @cluster,
        @localTerm, @serpStatus, datetime('now'), datetime('now')
      )
    `);

    const tx = this.db.transaction((items: typeof keywords) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    tx(keywords);
  }

  public getByNiche(nicheId: string): KeywordRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Keyword
      WHERE nicheId = ?
      ORDER BY volumeEstimate DESC, difficulty ASC
    `);
    return stmt.all(nicheId) as KeywordRecord[];
  }

  public getByNicheCountry(nicheCountryId: string): KeywordRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Keyword
      WHERE nicheCountryId = ?
      ORDER BY volumeEstimate DESC, difficulty ASC
    `);
    return stmt.all(nicheCountryId) as KeywordRecord[];
  }

  // --- SERP RESULTS ---

  public saveSerpResults(results: Omit<SerpResultRecord, 'createdAt' | 'updatedAt'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO SerpResult (
        id, nicheId, keywordId, position, url,
        title, contentType, domainStrength, screenshotPath,
        createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @keywordId, @position, @url,
        @title, @contentType, @domainStrength, @screenshotPath,
        datetime('now'), datetime('now')
      )
    `);

    const tx = this.db.transaction((items: typeof results) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    tx(results);
  }

  public getSerpResults(keywordId: string): SerpResultRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM SerpResult
      WHERE keywordId = ?
      ORDER BY position ASC
    `);
    return stmt.all(keywordId) as SerpResultRecord[];
  }
}
