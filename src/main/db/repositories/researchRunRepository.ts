/**
 * Niche Research Department - Research Run Repository
 * Manages autonomous research executions, status, and input modes.
 */

import type { ResearchRunRecord, ResearchRunStatus } from '../types';

export class ResearchRunRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public create(data: {
    id: string;
    inputMode: 'discovery' | 'own_niche' | 'own_domain';
    businessModes: string[];
    requestedQuantity: number;
    userNiche?: string | null;
    userDomain?: string | null;
    selectedCountries?: string[] | null;
    competitionLevel?: 'low' | 'medium' | 'high' | 'any';
    status?: ResearchRunStatus;
  }): ResearchRunRecord {
    const stmt = this.db.prepare(`
      INSERT INTO ResearchRun (
        id, inputMode, businessModes, requestedQuantity,
        userNiche, userDomain, selectedCountries, competitionLevel,
        status, currentPhase, errorLog, startedAt, completedAt,
        createdAt, updatedAt
      ) VALUES (
        @id, @inputMode, @businessModes, @requestedQuantity,
        @userNiche, @userDomain, @selectedCountries, @competitionLevel,
        @status, @currentPhase, @errorLog, datetime('now'), NULL,
        datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      inputMode: data.inputMode,
      businessModes: JSON.stringify(data.businessModes),
      requestedQuantity: data.requestedQuantity,
      userNiche: data.userNiche || null,
      userDomain: data.userDomain || null,
      selectedCountries: data.selectedCountries ? JSON.stringify(data.selectedCountries) : null,
      competitionLevel: data.competitionLevel || 'any',
      status: data.status || 'pending',
      currentPhase: 'Initialization',
      errorLog: null
    });

    return this.getById(data.id)!;
  }

  public getById(id: string): ResearchRunRecord | null {
    const stmt = this.db.prepare('SELECT * FROM ResearchRun WHERE id = ?');
    const row = stmt.get(id) as ResearchRunRecord | undefined;
    return row || null;
  }

  public getAll(limit = 50): ResearchRunRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM ResearchRun
      ORDER BY createdAt DESC
      LIMIT ?
    `);
    return stmt.all(limit) as ResearchRunRecord[];
  }

  public updateStatus(
    id: string,
    status: ResearchRunStatus,
    currentPhase?: string,
    errorLog?: string
  ): void {
    const isCompleted = status === 'completed' || status === 'failed';
    const stmt = this.db.prepare(`
      UPDATE ResearchRun SET
        status = @status,
        currentPhase = COALESCE(@currentPhase, currentPhase),
        errorLog = COALESCE(@errorLog, errorLog),
        completedAt = CASE WHEN @isCompleted = 1 THEN datetime('now') ELSE completedAt END,
        updatedAt = datetime('now')
      WHERE id = @id
    `);

    stmt.run({
      id,
      status,
      currentPhase: currentPhase || null,
      errorLog: errorLog || null,
      isCompleted: isCompleted ? 1 : 0
    });
  }

  public getActiveCount(): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM ResearchRun
      WHERE status NOT IN ('completed', 'failed')
    `);
    const row = stmt.get() as { count: number };
    return row?.count || 0;
  }
}
