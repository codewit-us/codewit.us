import type { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { Transaction } from 'sequelize';
import { sequelize, Exercise, Language } from '../models';

type Difficulty = 'worked example' | 'easy' | 'hard';
type Lang = 'python' | 'java' | 'cpp';

export async function importExercises(req: Request, res: Response) {
  try {
    const dryRun = String(req.query.dryRun ?? 'false') === 'true';
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) return res.status(400).json({ ok: false, error: 'Missing CSV file' });

    // 1) Parse CSV
    const rows = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
    }) as Record<string, string>[];

    // 2) Validate minimal fields that the DB actually stores + basic rules
    const errors: { row: number; field?: string; message: string }[] = [];
    const parsed: {
      language: Lang;             
      topic: string;             
      prompt: string;            
      referenceTest: string;     
      starterCode: string | null; 
      difficulty?: Difficulty;
      youtube_id?: string;
    }[] = [];

    rows.forEach((r, i) => {
      const rowNum = i + 2; 
      const language = (r.language ?? '').trim() as Lang;
      const topic = (r.concept ?? '').trim();
      const prompt = r.prompt_markdown ?? '';
      const referenceTest = r.test_script ?? '';
      const starterCode = (r.skeleton_code ?? '').trim() || null;
      const difficulty = (r.difficulty ?? '').trim() as Difficulty;
      const youtube_id = (r.youtube_id ?? '').trim();
      // not stored, but ensure present per team notes/Excel doc
      const author = (r.author ?? '').trim(); 

      // Basic checks
      if (!['python', 'java', 'cpp'].includes(language)) errors.push({ row: rowNum, field: 'language', message: 'language must be python | java | cpp' });
      if (!author) errors.push({ row: rowNum, field: 'author', message: 'author required' });
      if (!topic) errors.push({ row: rowNum, field: 'concept', message: 'concept (topic) required' });
      if (!prompt) errors.push({ row: rowNum, field: 'prompt_markdown', message: 'prompt_markdown required' });
      if (!referenceTest) errors.push({ row: rowNum, field: 'test_script', message: 'test_script required' });
      if (!['worked example', 'easy', 'hard'].includes(difficulty)) errors.push({ row: rowNum, field: 'difficulty', message: 'invalid difficulty' });
      if (difficulty === 'worked example' && !youtube_id) errors.push({ row: rowNum, field: 'youtube_id', message: 'youtube_id required for worked example' });
      if (difficulty !== 'worked example' && !starterCode) errors.push({ row: rowNum, field: 'skeleton_code', message: 'skeleton_code required for non-video exercise' });

      if (!errors.some(e => e.row === rowNum)) {
        parsed.push({ language, topic, prompt, referenceTest, starterCode, difficulty, youtube_id });
      }
    });

    if (errors.length) {
      return res.status(400).json({ ok: false, dryRun: true, rows: rows.length, errors, message: 'Validation failed' });
    }
    if (dryRun) {
      return res.json({ ok: true, dryRun: true, rows: rows.length, sample: parsed.slice(0, 3) });
    }

    // 3) Persist: upsert by (languageUid, topic, prompt)
    let created = 0, updated = 0;

    await sequelize.transaction(async (t: Transaction) => {
      // Resolve languages once
      const langs = await Language.findAll({ attributes: ['uid', 'name'], transaction: t });
      const nameToUid = new Map(langs.map(l => [String((l as any).name), (l as any).uid]));

      for (const r of parsed) {
        const languageUid = nameToUid.get(r.language);
        if (!languageUid) throw new Error(`Unknown language in DB: ${r.language}`);

        const where = { languageUid, topic: r.topic, prompt: r.prompt };
        const existing = await Exercise.findOne({ where, transaction: t });

        const data = {
          languageUid,
          topic: r.topic,
          prompt: r.prompt,
          referenceTest: r.referenceTest,
          starterCode: r.starterCode,
        };

        if (existing) {
          await existing.update(data, { transaction: t });
          updated++;
        } else {
          await Exercise.create(data as any, { transaction: t });
          created++;
        }
      }
    });

    return res.json({ ok: true, dryRun: false, rows: rows.length, created, updated });
  } catch (err) {
    console.error('courseImport.importExercises:', (err as Error).message);
    return res.status(500).json({ ok: false, error: 'Import failed' });
  }
}