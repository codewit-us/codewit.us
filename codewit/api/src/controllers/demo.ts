import { Demo, Exercise, Tag, Language, Module } from '../models';

async function getAllDemos(): Promise<Demo[]> {
  return await Demo.findAll({ include: [Exercise, Tag, Language] });
}

async function getDemoById(uid: number): Promise<Demo | null> {
  return await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
}

async function createDemo(
  title: string,
  youtube_id: string,
  topic: string,
  tags?: string[],
  language?: string
): Promise<Demo> {
  const demo = await Demo.create({ title, youtube_id, topic });
  if (tags) {
    const updatedTags = await Promise.all(
      tags.map(async (tag) => {
        const [updatedTag] = await Tag.findOrCreate({ where: { name: tag } });
        return updatedTag;
      })
    );

    await demo.setTags(updatedTags);
  }

  if (language) {
    const [languageInstance] = await Language.findOrCreate({
      where: { name: language },
    });
    await demo.setLanguage(languageInstance);

    const modules = await Module.findAll({
      where: {
        topic,
      },
      include: [{ model: Language, where: { uid: languageInstance.uid } }],
    });

    await Promise.all(
      modules.map(async (module) => {
        await module.addDemo(demo);
      })
    );
  }

  await demo.reload({ include: [Exercise, Tag, Language] });
  return demo;
}

async function updateDemo(
  uid: number,
  title?: string,
  youtube_id?: string,
  tags?: string[],
  language?: string,
  topic?: string
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  const oldTopic = demo.topic;
  const oldLanguage = demo.language;

  if (demo) {
    if (tags) {
      const updatedTags = await Promise.all(
        tags.map(async (tag) => {
          const [updatedTag] = await Tag.findOrCreate({ where: { name: tag } });
          return updatedTag;
        })
      );

      await demo.setTags(updatedTags);
    }
    if (language) {
      const [languageInstance] = await Language.findOrCreate({
        where: { name: language },
      });
      await demo.setLanguage(languageInstance);
    }
    if (title) demo.title = title;
    if (youtube_id) demo.youtube_id = youtube_id;
    if (topic) {
      demo.topic = topic;
    }

    await demo.save();
    await demo.reload({ include: [Exercise, Tag, Language] });

    if (topic || language) {
      if (oldLanguage && oldTopic) {
        const oldmodules = await Module.findAll({
          where: {
            topic: oldTopic,
          },
          include: [{ model: Language, where: { uid: oldLanguage.uid } }],
        });

        Promise.all(
          oldmodules.map(async (module) => {
            await module.removeDemo(demo.uid);
          })
        );
      }

      const modules = await Module.findAll({
        where: {
          topic: demo.topic,
        },
        include: [{ model: Language, where: { uid: demo.language.uid } }],
      });

      Promise.all(
        modules.map(async (module) => {
          await module.addDemo(demo);
        })
      );
    }
  }

  return demo;
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

async function likeDemo(uid: number): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    demo.likes++;
    await demo.save();
  }

  await demo.reload();
  return demo;
}

export {
  getAllDemos,
  getDemoById,
  createDemo,
  updateDemo,
  deleteDemo,
  likeDemo,
  addExercisesToDemo,
  removeExercisesFromDemo,
  setExercisesForDemo,
};
