/**
 * Niche Research Department - Chat Repository
 * Persists interactive Consultant Chat sessions with Department Head escalations.
 */

import type { ChatMessageRecord } from '../types';

export class ChatRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public saveMessage(data: {
    id: string;
    role: 'user' | 'consultant' | 'system';
    message: string;
    relatedNicheId?: string | null;
    relatedRunId?: string | null;
    forwardedToDepartmentHead?: boolean;
  }): ChatMessageRecord {
    const stmt = this.db.prepare(`
      INSERT INTO ChatMessage (
        id, role, message, relatedNicheId, relatedRunId,
        forwardedToDepartmentHead, createdAt, updatedAt
      ) VALUES (
        @id, @role, @message, @relatedNicheId, @relatedRunId,
        @forwardedToDepartmentHead, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      role: data.role,
      message: data.message,
      relatedNicheId: data.relatedNicheId || null,
      relatedRunId: data.relatedRunId || null,
      forwardedToDepartmentHead: data.forwardedToDepartmentHead ? 1 : 0
    });

    const getStmt = this.db.prepare('SELECT * FROM ChatMessage WHERE id = ?');
    return getStmt.get(data.id) as ChatMessageRecord;
  }

  public getHistory(limit = 100, relatedNicheId?: string): ChatMessageRecord[] {
    if (relatedNicheId) {
      const stmt = this.db.prepare(`
        SELECT * FROM ChatMessage
        WHERE relatedNicheId = ?
        ORDER BY createdAt ASC
        LIMIT ?
      `);
      return stmt.all(relatedNicheId, limit) as ChatMessageRecord[];
    }

    const stmt = this.db.prepare(`
      SELECT * FROM ChatMessage
      ORDER BY createdAt ASC
      LIMIT ?
    `);
    return stmt.all(limit) as ChatMessageRecord[];
  }
}
