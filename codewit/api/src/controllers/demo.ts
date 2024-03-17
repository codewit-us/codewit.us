import { Demo, Exercise, Tag, Language } from '../models';

async function getAllDemos(): Promise<Demo[]> {
  return await Demo.findAll({ include: [Exercise, Tag, Language] });
}

async function getDemoById(uid: number): Promise<Demo | null> {
  return await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
}

async function createDemo(
  title: string,
  youtube_id: string,
  tags?: string[],
  language?: string
): Promise<Demo> {
  const demo = await Demo.create({ title, youtube_id });
  if (tags) {
    const updatedTags = await Tag.bulkCreate(
      tags.map((tag) => ({ name: tag })),
      { ignoreDuplicates: true }
    );

    await demo.setTags(updatedTags.map((tag) => tag[0]));
  }

  if (language) {
    const [updatedLanguage] = await Language.findOrCreate({
      where: { name: language },
    });
    await demo.setLanguage(updatedLanguage);
  }

  demo.reload();
  return demo;
}

async function updateDemo(
  uid: number,
  title?: string,
  youtube_id?: string,
  tags?: string[],
  language?: string
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid, { include: [Exercise, Tag, Language] });
  if (demo) {
    if (tags) {
      const updatedTags = await Tag.bulkCreate(
        tags.map((tag) => ({ name: tag })),
        { ignoreDuplicates: true }
      );

      await demo.setTags(updatedTags.map((tag) => tag[0]));
    }
    if (language) {
      const [updatedLanguage] = await Language.findOrCreate({
        where: { name: language },
      });
      await demo.setLanguage(updatedLanguage);
    }
    if (title) demo.title = title;
    if (youtube_id) demo.youtube_id = youtube_id;

    await demo.save();
  }

  await demo.reload();
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
