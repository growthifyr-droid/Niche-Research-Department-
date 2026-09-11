/**
 * Niche Research Department - Competitor Repository
 * Deep competitive intelligence, domain teardowns, and page breakdown storage.
 */

import type { CompetitorRecord, CompetitorPageRecord } from '../types';

export class CompetitorRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public saveCompetitors(competitors: Omit<CompetitorRecord, 'createdAt' | 'updatedAt'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO Competitor (
        id, nicheId, nicheCountryId, domain, url,
        wordCountAvg, headingStructure, affiliateNetworks,
        adNetworks, socialProfiles, postingFrequency, contentFormats,
        emailCapture, opportunityScore, teardown, screenshotPath,
        createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @nicheCountryId, @domain, @url,
        @wordCountAvg, @headingStructure, @affiliateNetworks,
        @adNetworks, @socialProfiles, @postingFrequency, @contentFormats,
        @emailCapture, @opportunityScore, @teardown, @screenshotPath,
        datetime('now'), datetime('now')
      )
    `);

    const tx = this.db.transaction((items: typeof competitors) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    tx(competitors);
  }

  public getByNiche(nicheId: string): CompetitorRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Competitor
      WHERE nicheId = ?
      ORDER BY opportunityScore DESC
    `);
    return stmt.all(nicheId) as CompetitorRecord[];
  }

  public getByNicheCountry(nicheCountryId: string): CompetitorRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Competitor
      WHERE nicheCountryId = ?
      ORDER BY opportunityScore DESC
    `);
    return stmt.all(nicheCountryId) as CompetitorRecord[];
  }

  // --- COMPETITOR PAGES ---

  public savePages(pages: Omit<CompetitorPageRecord, 'createdAt' | 'updatedAt'>[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO CompetitorPage (
        id, nicheId, competitorId, pageUrl, pageType,
        wordCount, headings, screenshotPath,
        createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @competitorId, @pageUrl, @pageType,
        @wordCount, @headings, @screenshotPath,
        datetime('now'), datetime('now')
      )
    `);

    const tx = this.db.transaction((items: typeof pages) => {
      for (const item of items) {
        stmt.run(item);
      }
    });

    tx(pages);
  }

  public getPagesByCompetitor(competitorId: string): CompetitorPageRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM CompetitorPage
      WHERE competitorId = ?
      ORDER BY createdAt ASC
    `);
    return stmt.all(competitorId) as CompetitorPageRecord[];
  }
}
