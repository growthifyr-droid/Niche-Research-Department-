/**
 * Niche Research Department - Niche Repository
 * Core data isolation anchor: manages discovered/screened niches and country attachments.
 */

import type { NicheRecord, NicheCountryRecord, NicheStatus, DiscoverySource } from '../types';

export class NicheRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public create(data: {
    id: string;
    runId: string;
    name: string;
    description?: string | null;
    businessModelFit?: any;
    whyRelevant?: string | null;
    status?: NicheStatus;
    discoverySource: DiscoverySource;
    domainFitReason?: string | null;
  }): NicheRecord {
    const stmt = this.db.prepare(`
      INSERT INTO Niche (
        id, runId, name, description, businessModelFit,
        whyRelevant, status, rejectionReason, discoverySource,
        domainFitReason, createdAt, updatedAt
      ) VALUES (
        @id, @runId, @name, @description, @businessModelFit,
        @whyRelevant, @status, NULL, @discoverySource,
        @domainFitReason, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      runId: data.runId,
      name: data.name,
      description: data.description || null,
      businessModelFit: data.businessModelFit ? JSON.stringify(data.businessModelFit) : null,
      whyRelevant: data.whyRelevant || null,
      status: data.status || 'discovered',
      discoverySource: data.discoverySource,
      domainFitReason: data.domainFitReason || null
    });

    return this.getById(data.id)!;
  }

  public getById(id: string): NicheRecord | null {
    const stmt = this.db.prepare('SELECT * FROM Niche WHERE id = ?');
    const row = stmt.get(id) as NicheRecord | undefined;
    return row || null;
  }

  public getByRunId(runId: string): NicheRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Niche
      WHERE runId = ?
      ORDER BY createdAt DESC
    `);
    return stmt.all(runId) as NicheRecord[];
  }

  public getAll(limit = 100): NicheRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Niche
      ORDER BY createdAt DESC
      LIMIT ?
    `);
    return stmt.all(limit) as NicheRecord[];
  }

  public updateStatus(id: string, status: NicheStatus, rejectionReason?: string | null): void {
    const stmt = this.db.prepare(`
      UPDATE Niche SET
        status = @status,
        rejectionReason = @rejectionReason,
        updatedAt = datetime('now')
      WHERE id = @id
    `);
    stmt.run({ id, status, rejectionReason: rejectionReason || null });
  }

  public getTotalCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM Niche');
    const row = stmt.get() as { count: number };
    return row?.count || 0;
  }

  // --- NICHE COUNTRY METHODS (Country Isolation Anchor) ---

  public attachCountry(data: {
    id: string;
    nicheId: string;
    countryCode: string;
    potentialScore?: number | null;
    competitionLevel?: 'low' | 'medium' | 'high' | null;
    competitionReason?: string | null;
  }): NicheCountryRecord {
    const stmt = this.db.prepare(`
      INSERT INTO NicheCountry (
        id, nicheId, countryCode, status, potentialScore,
        competitionLevel, competitionReason, createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @countryCode, 'pending', @potentialScore,
        @competitionLevel, @competitionReason, datetime('now'), datetime('now')
      )
      ON CONFLICT(nicheId, countryCode) DO UPDATE SET
        potentialScore = excluded.potentialScore,
        competitionLevel = excluded.competitionLevel,
        competitionReason = excluded.competitionReason,
        updatedAt = datetime('now')
    `);

    stmt.run({
      id: data.id,
      nicheId: data.nicheId,
      countryCode: data.countryCode.toUpperCase(),
      potentialScore: data.potentialScore ?? null,
      competitionLevel: data.competitionLevel ?? null,
      competitionReason: data.competitionReason ?? null
    });

    const getStmt = this.db.prepare('SELECT * FROM NicheCountry WHERE id = ?');
    return getStmt.get(data.id) as NicheCountryRecord;
  }

  public getNicheCountries(nicheId: string): NicheCountryRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM NicheCountry
      WHERE nicheId = ?
      ORDER BY potentialScore DESC
    `);
    return stmt.all(nicheId) as NicheCountryRecord[];
  }
}
