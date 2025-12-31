import type { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { sequelize, Exercise, Language } from '../models';
import { Transaction } from 'sequelize';
import { Difficulty } from '../typings/response.types';

function parseDifficulty(raw: unknown): Difficulty | undefined {
  if (raw == null) return undefined;

  const norm = String(raw).toLowerCase().replace(/[_\s]+/g, ' ').trim();
  if (norm === 'easy' || norm === 'hard' || norm === 'worked example') {
    return norm as Difficulty;
  }
  return undefined;
}

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
    const data: {
      prompt: string;
      topic: string;
      languageUid: number;
      title: string;
      difficulty?: Difficulty | null;
      referenceTest: string;
      starterCode: string;
    }[] = [];

    rows.forEach((r, i) => {
      const rowNum = i + 2;
      const get = (k: string) => String((r[k] ?? '') as any).trim();

      // Map spreadsheet headers -> our fields
      const topic         = get('concept') || 'untagged';
      const title         = get('title');
      const prompt        = get('prompt_markdown');
      const referenceTest = get('test_script');
      const starterCode   = get('skeleton_code');
      const difficulty    = parseDifficulty(r['difficulty']);

      // Allow languageUid or language name
      let langUid: number | undefined;
      const rawUid = get('languageUid');
      if (rawUid) {
        const n = Number(rawUid);
        if (Number.isFinite(n) && n >= 1) {
          langUid = n;
        } else {
          errors.push({ row: rowNum, field: 'languageUid', message: 'languageUid must be a positive integer' });
        }
      } else {
        const langName = get('language').toLowerCase();
        if (langName) {
          const mapped = nameToUid.get(langName);
          if (typeof mapped === 'number') {
            langUid = mapped;
          } else {
            errors.push({ row: rowNum, field: 'language', message: `Unknown language: "${get('language')}"` });
          }
        } else {
          errors.push({ row: rowNum, field: 'language|languageUid', message: 'Provide language or languageUid' });
        }
      }

      // Validations
      if (!title)  errors.push({ row: rowNum, field: 'title', message: 'title is required' });
      if (!langUid) errors.push({ row: rowNum, field: 'language', message: 'language is required or unknown' });

      const rawDiff = (r['difficulty'] ?? '').toString().trim();
      if (rawDiff && !difficulty) {
        errors.push({
          row: rowNum, field: 'difficulty',
          message: `Unknown difficulty "${rawDiff}". Use one of: easy, hard, worked example`,
        });
      }

      if (!errors.some(e => e.row === rowNum)) {
        data.push({
          prompt,
          topic,
          languageUid: langUid!,
          title: title,
          referenceTest: referenceTest || '',
          starterCode: starterCode || '',
          difficulty: difficulty ?? null,
        });
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
          where: { languageUid: r.languageUid, title: r.title },
          transaction: t,
          attributes: ['uid'],
        });

        const payload = {
          languageUid : r.languageUid,
          topic       : r.topic,
          prompt      : r.prompt,
          referenceTest: r.referenceTest ?? '',
          starterCode : r.starterCode ?? '',
          title       : r.title,
          difficulty  : r.difficulty ?? null,
        };

        if (existing) {
          await (existing as any).update(payload, { transaction: t });
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