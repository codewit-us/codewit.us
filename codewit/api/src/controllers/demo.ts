import { Demo, Exercise } from '../models';

async function getAllDemos(): Promise<Demo[]> {
  return await Demo.findAll({ include: Exercise });
}

async function getDemoById(uid: number): Promise<Demo | null> {
  return await Demo.findByPk(uid, { include: Exercise });
}

async function createDemo(title: string, youtube_id: string): Promise<Demo> {
  return await Demo.create({ title, youtube_id });
}

async function updateDemo(
  uid: number,
  title?: string,
  youtube_id?: string
): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid);
  if (demo) {
    if (title) demo.title = title;
    if (youtube_id) demo.youtube_id = youtube_id;

    await demo.save();
  }

  return demo;
}

async function deleteDemo(uid: number): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid);
  if (demo) {
    await demo.destroy();
  }

  return demo;
}

async function likeDemo(uid: number): Promise<Demo | null> {
  const demo = await Demo.findByPk(uid);
  if (demo) {
    demo.likes++;
    await demo.save();
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
};
