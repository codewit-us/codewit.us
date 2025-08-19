import {
  Demo,
  Exercise,
  Tag,
  Language,
  Module,
  DemoTags,
  sequelize,
  DemoExercises,
} from '../models';
import { DemoResponse } from '../typings/response.types';
import { formatDemoResponse } from '../utils/responseFormatter';

async function getAllDemos(): Promise<DemoResponse[]> {
  const demos = await Demo.findAll({
    include: [Exercise, Tag, Language,],
    order: [
      [Language, "name", "DESC"],
      ["title", "ASC"],
      [Tag, DemoTags, 'ordering', 'ASC'],
      [Exercise, DemoExercises, "order", "ASC"],
    ],
  });

  return formatDemoResponse(demos);
}

async function getDemoById(uid: number): Promise<DemoResponse | null> {
  const demo =  await Demo.findByPk(uid, {
    include: [Exercise, Tag, Language],
    order: [
      [Tag, DemoTags, 'ordering', 'ASC'],
      [Exercise, DemoExercises, "order", "ASC"]
    ],
  });
  return demo ? formatDemoResponse(demo) : null;
}

async function createDemo(
  title: string,
  youtube_id: string,
  youtube_thumbnail: string,
  topic: string,
  tags?: string[],
  language?: string,
  exercises?: number[],
): Promise<DemoResponse> {
  return await sequelize.transaction(async (transaction) => {
    const demo = await Demo.create(
      { title, youtube_id, youtube_thumbnail, topic },
      { transaction }
    );
    if (tags) {
      await Promise.all(
        tags.map(async (tag, idx) => {
          const [tagInstance] = await Tag.findOrCreate({
            where: { name: tag },
            transaction,
          });
          await demo.addTag(tagInstance, {
            through: { ordering: idx + 1 },
            transaction,
          });
        })
      );
    }

    if (language) {
      const [languageInstance] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });
      await demo.setLanguage(languageInstance, { transaction });

      const modules = await Module.findAll({
        where: {
          topic,
        },
        include: [{ model: Language, where: { uid: languageInstance.uid } }],
        transaction,
      });

      await Promise.all(
        modules.map(async (module) => {
          await module.addDemo(demo, { transaction });
        })
      );
    }

    if (exercises != null && exercises.length > 0) {
      await Promise.all(exercises.map((id, index) => DemoExercises.create(
        {
          demoUid: demo.uid,
          exerciseUid: id,
          order: index,
        },
        {
          transaction
        }
      )));
    }

    await demo.reload({
      include: [Exercise, Tag, Language],
      order: [
        [Tag, DemoTags, 'ordering', 'ASC'],
        [Exercise, DemoExercises, "order", "ASC"],
      ],
      transaction,
    });

    return formatDemoResponse(demo);
  });
}

async function updateDemo(
  uid: number,
  title?: string,
  youtube_id?: string,
  youtube_thumbnail?: string,
  tags?: string[],
  language?: string,
  topic?: string,
  exercises?: number[],
): Promise<DemoResponse> {
  return await sequelize.transaction(async (transaction) => {
    const demo = await Demo.findByPk(uid, {
      include: [Exercise, Tag, Language],
      transaction,
    });

    if (!demo) {
      throw new Error("Demo not found");
    }

    if (tags) {
      await demo.setTags([], { transaction });
      await Promise.all(
        tags.map(async (tag, idx) => {
          const [tagInstance] = await Tag.findOrCreate({
            where: { name: tag },
            transaction,
          });
          await demo.addTag(tagInstance, {
            through: { ordering: idx + 1 },
            transaction,
          });
        })
      );
    }

    if (language) {
      const [languageInstance] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });
      await demo.setLanguage(languageInstance, { transaction });
    }

    if (title) {
      demo.title = title;
    }

    if (youtube_id) {
      demo.youtube_id = youtube_id;
    }

    if (youtube_thumbnail) {
      demo.youtube_thumbnail = youtube_thumbnail;
    }

    if (topic) {
      demo.topic = topic;
    }

    if (exercises != null) {
      const current = await demo.getExercises({ transaction });
      let to_drop = new Set(current.map((e => e.uid)));
      let awaiting = [];

      for (let index = 0; index < exercises.length; index += 1) {
        to_drop.delete(exercises[index]);

        awaiting.push(DemoExercises.upsert(
          {
            demoUid: demo.uid,
            exerciseUid: exercises[index],
            order: index
          },
          {
            transaction
          }
        ));
      }

      if (to_drop.size > 0) {
        let as_list = Array.from(to_drop);

        awaiting.push(demo.removeExercises(as_list, {transaction}));
      }

      await Promise.all(awaiting);
    }

    await demo.save({ transaction });

    if (topic || language) {
      const oldTopic = demo.topic;
      const oldLanguage = demo.language;

      if (oldLanguage && oldTopic) {
        const oldModules = await Module.findAll({
          where: { topic: oldTopic },
          include: [{ model: Language, where: { uid: oldLanguage.uid } }],
          transaction,
        });

        await Promise.all(
          oldModules.map(async (module) => {
            await module.removeDemo(demo.uid, { transaction });
          })
        );
      }

      const newModules = await Module.findAll({
        where: { topic: demo.topic },
        include: [{ model: Language, where: { uid: demo.language.uid } }],
        transaction,
      });

      await Promise.all(
        newModules.map(async (module) => {
          await module.addDemo(demo, { transaction });
        })
      );
    }

    await demo.reload({
      include: [Exercise, Tag, Language],
      order: [
        [Tag, DemoTags, 'ordering', 'ASC'],
        [Exercise, DemoExercises, "order", "ASC"]
      ],
      transaction,
    });

    return formatDemoResponse(demo);
  });
}

async function addExercisesToDemo(
  uid: number,
  exercises: number[]
): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.addExercises(exercises);
    await demo.reload();
  }

  return demo ? formatDemoResponse(demo) : null;
}

async function removeExercisesFromDemo(
  uid: number,
  exercises: number[]
): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.removeExercises(exercises);
    await demo.reload();
  }

  return demo ? formatDemoResponse(demo) : null;
}

async function setExercisesForDemo(
  uid: number,
  exercises: number[]
): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.setExercises(exercises);
    await demo.reload();
  }

  return demo ? formatDemoResponse(demo) : null;
}

async function deleteDemo(uid: number): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.destroy();
  }

  return demo ? formatDemoResponse(demo) : null;
}

async function likeDemo(uid: number, user_uid: number): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });

  if (!demo) {
    return null;
  }

  const isliked = await demo.hasLikedBy(user_uid);
  if (!isliked) {
    demo.addLikedBy(user_uid);
    demo.likes += 1;

    await demo.save();
    await demo.reload();
  }

  return demo ? formatDemoResponse(demo) : null;
}

async function removeLikeDemo(
  uid: number,
  user_uid: number
): Promise<DemoResponse | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });

  if (!demo) {
    return null;
  }

  const isliked = await demo.hasLikedBy(user_uid);
  if (isliked) {
    demo.removeLikedBy(user_uid);
    demo.likes -= 1;

    await demo.save();
    await demo.reload();
  }

  return demo ? formatDemoResponse(demo) : null;
}

export {
  getAllDemos,
  getDemoById,
  createDemo,
  updateDemo,
  deleteDemo,
  likeDemo,
  removeLikeDemo,
  addExercisesToDemo,
  removeExercisesFromDemo,
  setExercisesForDemo,
};
