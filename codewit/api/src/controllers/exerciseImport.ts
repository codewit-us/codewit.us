import type { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { sequelize, Exercise, Language } from '../models';
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
    }) as Record<string, unknown>[];

    const langs = await Language.findAll({ attributes: ['uid', 'name'] });
    const nameToUid = new Map(
      langs.map(l => [String((l as any).name).toLowerCase(), Number((l as any).uid)])
    );

    const errors: { row: number; field?: string; message: string }[] = [];
    const data: { prompt: string; topic: string; languageUid: number }[] = [];

    rows.forEach((r, i) => {
      const rowNum = i + 2; 
      const get = (k: string) => String((r[k] ?? '') as any).trim();

      const prompt = get('prompt');
      const topic  = get('topic');

      let langUid: number | undefined;
      const rawUid = get('languageUid');
      if (rawUid !== '') {
        const n = Number(rawUid);
        if (Number.isFinite(n) && n >= 1) {
          langUid = n;
        } else {
          errors.push({ row: rowNum, field: 'languageUid', message: 'languageUid must be a positive integer (e.g., 1=cpp, 2=java, 3=python)' });
        }
      } else {
        const langName = get('language').toLowerCase();
        if (langName) {
          const mapped = nameToUid.get(langName);
          if (typeof mapped === 'number') {
            langUid = mapped;
          } else {
            errors.push({ row: rowNum, field: 'language', message: `Unknown language name: "${get('language')}"` });
          }
        } else {
          errors.push({ row: rowNum, field: 'language|languageUid', message: 'Provide languageUid or language' });
        }
      }

      if (!prompt) errors.push({ row: rowNum, field: 'prompt', message: 'prompt is required' });
      if (!topic)  errors.push({ row: rowNum, field: 'topic',  message: 'topic is required' });

      if (!errors.some(e => e.row === rowNum)) {
        data.push({ prompt, topic, languageUid: langUid! });
      }
    });

    if (errors.length) {
      return res.status(400).json({
        ok: false,
        message: 'Validation failed',
        errors,
        rows: rows.length,
        headers: rows[0] ? Object.keys(rows[0]) : [],
        languages: langs.map(l => ({ uid: (l as any).uid, name: (l as any).name })), 
      });
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