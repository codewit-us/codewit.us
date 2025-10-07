import type { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { sequelize, Exercise } from '../models';
import { Transaction } from 'sequelize';

export async function importExercisesCsv(req: Request, res: Response) {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ ok: false, message: 'Missing CSV file' });
    }

    const rows = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    }) as { prompt?: string; topic?: string; languageUid?: string | number }[];

    const errors: { row: number; message: string }[] = [];
    const data: { prompt: string; topic: string; languageUid: number }[] = [];

    rows.forEach((r, i) => {
      const row = i + 2; 
      const prompt = (r.prompt ?? '').trim();
      const topic = (r.topic ?? '').trim();
      const langNum = Number(r.languageUid);

      if (!prompt) errors.push({ row, message: 'prompt is required' });
      if (!topic) errors.push({ row, message: 'topic is required' });
      if (!Number.isFinite(langNum) || langNum <= 0) {
        errors.push({ row, message: 'languageUid must be a positive number' });
      }

      if (!errors.some(e => e.row === row)) {
        data.push({ prompt, topic, languageUid: langNum });
      }
    });

    if (errors.length) {
      return res.status(400).json({ ok: false, message: 'Validation failed', errors, rows: rows.length });
    }

    let created = 0, updated = 0;

    await sequelize.transaction(async (t: Transaction) => {
      for (const r of data) {
        const existing = await Exercise.findOne({
          where: { languageUid: r.languageUid, prompt: r.prompt },
          transaction: t,
        });

        const payload = {
          languageUid: r.languageUid,
          topic: r.topic,
          prompt: r.prompt,
          referenceTest: '',
          starterCode: '',  
        };

        if (existing) {
          await existing.update(payload as any, { transaction: t });
          updated++;
        } else {
          await Exercise.create(payload as any, { transaction: t });
          created++;
        }
      }
    });

    return res.json({ ok: true, created, updated, rows: rows.length });
  } catch (err) {
    console.error('exerciseImport.importExercisesCsv:', err);
    return res.status(500).json({ ok: false, message: 'Import failed' });
  }
}