/**
 * Niche Research Department - Report & Export Repository
 * Stores generated 15-page dossier reports, PDF paths, and SEO handoff packages.
 */

import type { ReportRecord, SeoHandoffPackageRecord } from '../types';

export class ReportRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  public create(data: {
    id: string;
    nicheId: string;
    title: string;
    language: 'english' | 'urdu';
    sections?: any;
    renderedHtmlPath?: string | null;
    pdfPath?: string | null;
    brandingConfig?: any;
    status?: 'generating' | 'completed' | 'failed';
  }): ReportRecord {
    const stmt = this.db.prepare(`
      INSERT INTO Report (
        id, nicheId, title, language, sections,
        renderedHtmlPath, pdfPath, brandingConfig,
        status, createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @title, @language, @sections,
        @renderedHtmlPath, @pdfPath, @brandingConfig,
        @status, datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      nicheId: data.nicheId,
      title: data.title,
      language: data.language,
      sections: data.sections ? JSON.stringify(data.sections) : null,
      renderedHtmlPath: data.renderedHtmlPath || null,
      pdfPath: data.pdfPath || null,
      brandingConfig: data.brandingConfig ? JSON.stringify(data.brandingConfig) : null,
      status: data.status || 'generating'
    });

    return this.getById(data.id)!;
  }

  public getById(id: string): ReportRecord | null {
    const stmt = this.db.prepare('SELECT * FROM Report WHERE id = ?');
    const row = stmt.get(id) as ReportRecord | undefined;
    return row || null;
  }

  public getByNiche(nicheId: string): ReportRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Report
      WHERE nicheId = ?
      ORDER BY createdAt DESC
    `);
    return stmt.all(nicheId) as ReportRecord[];
  }

  public getAll(limit = 50): ReportRecord[] {
    const stmt = this.db.prepare(`
      SELECT * FROM Report
      ORDER BY createdAt DESC
      LIMIT ?
    `);
    return stmt.all(limit) as ReportRecord[];
  }

  public getCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM Report WHERE status = "completed"');
    const row = stmt.get() as { count: number };
    return row?.count || 0;
  }

  // --- SEO HANDOFF PACKAGES ---

  public saveHandoffPackage(data: {
    id: string;
    nicheId: string;
    packageData: any;
    status: 'ready' | 'exported';
  }): SeoHandoffPackageRecord {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO SeoHandoffPackage (
        id, nicheId, packageData, status, exportedAt,
        createdAt, updatedAt
      ) VALUES (
        @id, @nicheId, @packageData, @status, NULL,
        datetime('now'), datetime('now')
      )
    `);

    stmt.run({
      id: data.id,
      nicheId: data.nicheId,
      packageData: JSON.stringify(data.packageData),
      status: data.status
    });

    const getStmt = this.db.prepare('SELECT * FROM SeoHandoffPackage WHERE id = ?');
    return getStmt.get(data.id) as SeoHandoffPackageRecord;
  }
}
