/**
 * Niche Research Department - Activity Log Repository
 * Powers the real-time activity feed with telemetry events from all 35 agents.
 */

import type { ActivityLogRecord, ActivityLogStatus } from '../types';

export class ActivityLogRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public log(data: {
    id: string;
    runId?: string | null;
    agentName: string;
    action: string;
    details?: any;
    status: ActivityLogStatus;
  }): void {
    const stmt = this.db.prepare(`
      INSERT INTO ActivityLog (
        id, runId, agentName, action, details,
        status, createdAt, updatedAt
      ) VALUES (
        @id, @runId, @agentName, @action, @details,
        @status, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      runId: data.runId || null,
      agentName: data.agentName,
      action: data.action,
      details: data.details ? JSON.stringify(data.details) : null,
      status: data.status
    });
  }

  public getRecent(limit = 20, runId?: string): ActivityLogRecord[] {
    if (runId) {
      const stmt = this.db.prepare(`
        SELECT * FROM ActivityLog
        WHERE runId = ?
        ORDER BY createdAt DESC
        LIMIT ?
      `);
      return stmt.all(runId, limit) as ActivityLogRecord[];
    }

    const stmt = this.db.prepare(`
      SELECT * FROM ActivityLog
      ORDER BY createdAt DESC
      LIMIT ?
    `);
    return stmt.all(limit) as ActivityLogRecord[];
  }
}
