import {
  Demo,
  Exercise,
  Tag,
  Language,
  Module,
  DemoTags,
  sequelize,
} from '../models';
import { DemoResponse } from '../typings/response.types';
import { formatDemoResponse } from '../utils/responseFormatter';

async function getAllDemos(): Promise<Demo[]> {
  return await Demo.findAll({
    include: [Exercise, Tag, Language],
    order: [[Tag, DemoTags, 'ordering', 'ASC']],
  });
}

async function getDemoById(uid: number): Promise<Demo | null> {
  return await Demo.findByPk(uid, {
    include: [Exercise, Tag, Language],
    order: [[Tag, DemoTags, 'ordering', 'ASC']],
  });
}

async function createDemo(
  title: string,
  youtube_id: string,
  topic: string,
  tags?: string[],
  language?: string
): Promise<DemoResponse> {
  return await sequelize.transaction(async (transaction) => {
    const demo = await Demo.create(
      { title, youtube_id, topic },
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

    await demo.reload({
      include: [Exercise, Tag, Language],
      order: [[Tag, DemoTags, 'ordering', 'ASC']],
      transaction,
    });

    return formatDemoResponse(demo);
  });
}

async function updateDemo(
  uid: number,
  title?: string,
  youtube_id?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<DemoResponse> {
  return await sequelize.transaction(async (transaction) => {
    const demo = await Demo.findByPk(uid, {
      include: [Exercise, Tag, Language],
      transaction,
    });
    const oldTopic = demo.topic;
    const oldLanguage = demo.language;

    if (demo) {
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
      if (title) demo.title = title;
      if (youtube_id) demo.youtube_id = youtube_id;
      if (topic) {
        demo.topic = topic;
      }

      await demo.save({ transaction });
      await demo.reload({
        include: [Exercise, Tag, Language],
        order: [[Tag, DemoTags, 'ordering', 'ASC']],
        transaction,
      });

      if (topic || language) {
        if (oldLanguage && oldTopic) {
          const oldmodules = await Module.findAll({
            where: {
              topic: oldTopic,
            },
            include: [{ model: Language, where: { uid: oldLanguage.uid } }],
            transaction,
          });

          Promise.all(
            oldmodules.map(async (module) => {
              await module.removeDemo(demo.uid, { transaction });
            })
          );
        }

        const modules = await Module.findAll({
          where: {
            topic: demo.topic,
          },
          include: [{ model: Language, where: { uid: demo.language.uid } }],
          transaction,
        });

        Promise.all(
          modules.map(async (module) => {
            await module.addDemo(demo, { transaction });
          })
        );
      }
    }

    return formatDemoResponse(demo);
  });
}

async function addExercisesToDemo(
  uid: number,
  exercises: number[]
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.addExercises(exercises);
    await demo.reload();
  }

  return demo;
}

async function removeExercisesFromDemo(
  uid: number,
  exercises: number[]
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.removeExercises(exercises);
    await demo.reload();
  }

  return demo;
}

async function setExercisesForDemo(
  uid: number,
  exercises: number[]
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.setExercises(exercises);
    await demo.reload();
  }

  return demo;
}

async function deleteDemo(uid: number): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    await demo.destroy();
  }

  return demo;
}

async function likeDemo(uid: number, user_uid: number): Promise<Demo | null> {
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

  return demo;
}

async function removeLikeDemo(
  uid: number,
  user_uid: number
): Promise<Demo | null> {
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

  return demo;
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
