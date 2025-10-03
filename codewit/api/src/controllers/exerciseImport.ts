import type { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { sequelize, Exercise, Language } from '../models';
import { Transaction } from 'sequelize';

// CSV columns per team doc:
// language, author, youtube_id, concept, title, test_script, skeleton_code, prompt_markdown, solution_code, solution_output, difficulty
// Only a subset is stored on Exercise: language -> languageUid, topic(concept), prompt(prompt_markdown) 

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
    }) as Record<string, string>[];

    type Lang = 'python' | 'java' | 'cpp';
    const errors: { row: number; field?: string; message: string }[] = [];
    const parsed: {
      language: Lang;
      topic: string;
      prompt: string;
    }[] = [];

    rows.forEach((r, i) => {
      const rowNum = i + 2; 
      const language = (r.language ?? '').trim().toLowerCase() as Lang;
      const topic = (r.concept ?? '').trim();
      const prompt = (r.prompt_markdown ?? '').trim();
      const difficulty = (r.difficulty ?? '').trim().toLowerCase();
      const youtube_id = (r.youtube_id ?? '').trim();

      if (!['python', 'java', 'cpp'].includes(language)) {
        errors.push({ row: rowNum, field: 'language', message: 'language must be python | java | cpp' });
      }
      if (!topic) errors.push({ row: rowNum, field: 'concept', message: 'concept required' });
      if (!prompt) errors.push({ row: rowNum, field: 'prompt_markdown', message: 'prompt_markdown required' });

      if (difficulty === 'worked example' && !youtube_id) {
        errors.push({ row: rowNum, field: 'youtube_id', message: 'youtube_id required for worked example' });
      }
      
      if (!errors.some(e => e.row === rowNum)) {
        parsed.push({ language, topic, prompt });
      }
    });

    if (errors.length) {
      return res.status(400).json({ ok: false, message: 'Validation failed', errors, rows: rows.length });
    }

    let created = 0, updated = 0;

    await sequelize.transaction(async (t: Transaction) => {
      // map language name -> uid once
      const langs = await Language.findAll({ attributes: ['uid', 'name'], transaction: t });
      const nameToUid = new Map(langs.map(l => [String((l as any).name), (l as any).uid]));

      for (const r of parsed) {
        const languageUid = nameToUid.get(r.language);
        if (!languageUid) {
          throw new Error(`Unknown language in DB: ${r.language}`);
        }

        const existing = await Exercise.findOne({
          where: { languageUid, topic: r.topic, prompt: r.prompt },
          transaction: t,
        });

        const data = {
          languageUid,
          topic: r.topic,
          prompt: r.prompt,
          referenceTest: '# placeholder',
          starterCode: null,
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

    return res.json({ ok: true, created, updated, rows: rows.length });
  } catch (err) {
    console.error('exerciseImport.importExercisesCsv:', err);
    return res.status(500).json({ ok: false, message: 'Import failed' });
  }
}