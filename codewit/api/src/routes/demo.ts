import { Router } from 'express';
import {
  addExercisesToDemo,
  createDemo,
  deleteDemo,
  getAllDemos,
  getDemoById,
  likeDemo,
  removeExercisesFromDemo,
  removeLikeDemo,
  setExercisesForDemo,
  updateDemo,
} from '../controllers/demo';
import {
  addExercisesToDemoSchema,
  createDemoSchema,
  removeExercisesFromDemoSchema,
  setExercisesForDemoSchema,
  updateDemoSchema,
} from '@codewit/validations';
import { DemoAttempt } from "@codewit/interfaces";
import { fromZodError } from 'zod-validation-error';
import { checkAdmin } from '../middleware/auth';
import { asyncHandle } from '../middleware/catch';
import { Attempt, Demo, DemoTags, Language, sequelize, Tag, UserExerciseCompletion } from '../models';
import { Op, QueryTypes } from 'sequelize';

const demoRouter = Router();

demoRouter.get('/', async (req, res) => {
  try {
    const demos = await getAllDemos();
    res.json(demos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.get('/:uid', async (req, res) => {
  try {
    const demo = await getDemoById(Number(req.params.uid));
    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

function parse_non_zero_int(given: string): number | null {
  let parsed = parseInt(given, 10);

  if (isNaN(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

demoRouter.get("/:uid/attempt", asyncHandle(async (req, res) => {
  let maybe_module_id = typeof req.query.module_id === "string" ?
    parse_non_zero_int(req.query.module_id) :
    null;

  const demo_record = await Demo.findByPk(req.params.uid, {
    include: [
      {
        association: Demo.associations.exercises,
        include: [
          Language,
          {
            model: UserExerciseCompletion,
            where: {
              userUid: req.user.uid
            },
            required: false
          }
        ]
      },
      Tag,
      Language
    ],
    order: [[Tag, DemoTags, "ordering", "ASC"]]
  });

  if (demo_record == null) {
    return res.status(404).json({error: "DemoNotFound"});
  }

  let tags = [];

  for (let tag of demo_record.tags) {
    tags.push(tag.name);
  }

  let exercises = [];

  const exercise_uids = demo_record.exercises.map(ex => ex.uid);
  const last_attempts: Record<number, string | null> = {};

  if (exercise_uids.length > 0) {
    const attempts = await Attempt.findAll({
      where: {
        exerciseUid: {
          [Op.in]: exercise_uids
        },
        userUid: req.user.uid
      },
      attributes: ["exerciseUid", "code", "submissionNumber"],
      order: [
        ["exerciseUid", "ASC"],
        ["submissionNumber", "DESC"],
      ]
    });

    for (const attempt of attempts) {
      const exercise_uid = attempt.getDataValue("exerciseUid");

      if (!(exercise_uid in last_attempts)) {
        last_attempts[exercise_uid] = attempt.getDataValue("code");
      }
    }
  }

  for (let exercise of demo_record.exercises) {
    let completion = 0.0;

    if (exercise["UserExerciseCompletions"]?.length ?? 0 != 0) {
      completion = exercise["UserExerciseCompletions"][0].completion ?? 0.0;
    }

    exercises.push({
      uid: exercise.uid,
      prompt: exercise.prompt,
      language: exercise.language.name,
      skeleton: exercise.starterCode,
      completion,
      last_attempt: last_attempts[exercise.uid] ?? null,
    });
  }

  let resources = null;
  let related_demos = null;

  if (maybe_module_id != null) {
    let [resources_result, demos_results] = await Promise.all([
      sequelize.query<{
        uid: number,
        url: string,
        title: string,
        source: string,
        liked: boolean
      }>(`
        select resources.uid,
               resources.url,
               resources.title,
               resources.source,
               resc_likes."userUid" is not null as liked
        from resources
          join "ModuleResources" as mod_resc on
            resources.uid = mod_resc."resourceUid" and
            mod_resc."moduleUid" = $1
          left join "ResourceLikes" as resc_likes on
            resources.uid = resc_likes."resourceUid" and
            resc_likes."userUid" = $2`,
        {
          type: QueryTypes.SELECT,
          bind: [maybe_module_id, req.user.uid]
        }
      ),
      sequelize.query<{
        uid: number,
        title: string,
        topic: string,
        youtube_id: string,
        youtube_thumbnail: string,
        completion: number
      }>(`
        select demos.uid,
               demos.title,
               demos.topic,
               demos.youtube_id,
               demos.youtube_thumbnail,
               demo_cmplt.completion
        from demos
          join "ModuleDemos" as mod_demos on
            demos.uid = mod_demos."demoUid"
          left join "UserDemoCompletions" as demo_cmplt on
            demos.uid = demo_cmplt."demoUid" and
            demo_cmplt."userUid" = $2
        where mod_demos."moduleUid" = $1 and
              demos.uid != $3`,
        {
          type: QueryTypes.SELECT,
          bind: [maybe_module_id, req.user.uid, demo_record.uid]
        }
      )
    ]);

    resources = [];

    for (let resc of resources_result) {
      resources.push({...resc});
    }

    related_demos = [];

    for (let demo of demos_results) {
      let completion = demo.completion ?? 0.0;

      related_demos.push({
        uid: demo.uid,
        title: demo.title,
        topic: demo.topic,
        youtube_id: demo.youtube_id,
        youtube_thumbnail: demo.youtube_thumbnail,
        completion
      });
    }
  }

  res.json({
    demo: {
      uid: demo_record.uid,
      title: demo_record.title,
      topic: demo_record.topic,
      language: demo_record.language.name,
      youtube_id: demo_record.youtube_id,
      youtube_thumbnail: demo_record.youtube_thumbnail,
      // does not seem to be an easy way to get this without another query
      // stuff
      liked: await demo_record.hasLikedBy(req.user.uid),
      tags,
      exercises,
    },
    resources,
    related_demos,
  } as DemoAttempt);
}));

demoRouter.post('/', checkAdmin, async (req, res) => {
  try {
    const validatedBody = createDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await createDemo(
      validatedBody.data.title,
      validatedBody.data.youtube_id,
      validatedBody.data.youtube_thumbnail,
      validatedBody.data.topic,
      validatedBody.data.tags,
      validatedBody.data.language,
      validatedBody.data.exercises,
    );

    res.json(demo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.patch('/:uid', checkAdmin, async (req, res) => {
  try {
    const validatedBody = updateDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await updateDemo(
      Number(req.params.uid),
      validatedBody.data.title,
      validatedBody.data.youtube_id,
      validatedBody.data.youtube_thumbnail,
      validatedBody.data.tags,
      validatedBody.data.language,
      validatedBody.data.topic,
      validatedBody.data.exercises,
    );

    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.post('/:uid/like', asyncHandle(async (req, res) => {
  let demo_uid = parse_non_zero_int(req.params.uid);

  if (demo_uid == null) {
    return res.status(400).json({error: "InvalidDemoUid"});
  }

  try {
    await sequelize.transaction(async transaction => {
      let [_, metadata] = await sequelize.query(
        `\
        insert into "DemoLikes" ("demoUid", "userUid", "createdAt", "updatedAt") values \
        ($1, $2, $3, $3) \
        on conflict on constraint "DemoLikes_pkey" do nothing`,
        {
          bind: [demo_uid, req.user.uid, new Date()],
          type: QueryTypes.INSERT,
          transaction,
        }
      );

      if (metadata === 1) {
        let [_, metadata] = await sequelize.query(
          `update demos set likes = likes + 1 where uid = $1`,
          {
            bind: [demo_uid],
            type: QueryTypes.UPDATE,
            transaction,
          }
        );
      }

      return res.status(200).end();
    });
  } catch (err) {
    // documentation did not list this so hopefully this will continue work
    if (err.name === "SequelizeForeignKeyConstraintError") {
      if (err.index === "DemoLikes_demoUid_fkey") {
        return res.status(404).json({error: "DemoNotFound"});
      }
    }

    throw err;
  }
}));

demoRouter.delete('/:uid/like', asyncHandle(async (req, res) => {
  let demo_uid = parse_non_zero_int(req.params.uid);

  if (demo_uid == null) {
    return res.status(400).json({error: "InvalidDemoUid"});
  }

  await sequelize.transaction(async transaction => {
    // it would seem that no type information is provided if the query is raw
    let [_, metadata]: [any ,any] = await sequelize.query(
      `delete from "DemoLikes" where "demoUid" = $1 and "userUid" = $2`,
      {
        bind: [demo_uid, req.user.uid],
        type: QueryTypes.RAW,
        transaction
      }
    );

    if (metadata.rowCount === 1) {
      let [_result, _metadata] = await sequelize.query(
        `update demos set likes = likes - 1 where uid = $1`,
        {
          bind: [demo_uid],
          type: QueryTypes.UPDATE,
          transaction
        }
      );
    }

    return res.status(200).end();
  });
}));

demoRouter.patch('/:uid/exercises', checkAdmin, async (req, res) => {
  try {
    const validatedBody = addExercisesToDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await addExercisesToDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
    );

    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.delete('/:uid/exercises', checkAdmin, async (req, res) => {
  try {
    const validatedBody = removeExercisesFromDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await removeExercisesFromDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
    );

    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.put('/:uid/exercises', checkAdmin, async (req, res) => {
  try {
    const validatedBody = setExercisesForDemoSchema.safeParse(req.body);

    if (validatedBody.success === false) {
      return res
        .status(400)
        .json({ message: fromZodError(validatedBody.error).toString() });
    }

    const demo = await setExercisesForDemo(
      Number(req.params.uid),
      validatedBody.data.exercises
    );

    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

demoRouter.delete('/:uid', checkAdmin, async (req, res) => {
  try {
    const demo = await deleteDemo(Number(req.params.uid));
    if (demo) {
      res.json(demo);
    } else {
      res.status(404).json({ message: 'Demo not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default demoRouter;
