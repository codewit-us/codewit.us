import { Demo, Language, Module, Resource } from '../models';

async function createModule(
  topic: string,
  language: string,
  resources: number[]
): Promise<Module> {
  const [languageInstance] = await Language.findOrCreate({
    where: { name: language },
  });

  const demos = await Demo.findAll({
    include: [{ model: Language, where: { uid: languageInstance.uid } }],
    where: { topic },
  });

  // add demos to the module along with language instance
  const module = await Module.create({
    topic,
  });

  await module.setDemos(demos);
  await module.setLanguage(languageInstance);

  await module.setResources(resources);
  await module.reload({ include: [Language, Demo, Resource] });
  return module;
}

async function getModule(uid: number): Promise<Module | null> {
  const module = await Module.findByPk(uid, {
    include: [Language, Demo, Resource],
  });

  return module;
}

async function updateModule(
  uid: number,
  topic?: string,
  language?: string,
  resources?: number[]
): Promise<Module | null> {
  const module = await Module.findByPk(uid);
  if (!module) {
    return;
  }
  if (topic) {
    module.topic = topic;
  }
  if (language) {
    const [languageInstance] = await Language.findOrCreate({
      where: { name: language },
    });

    await module.setLanguage(languageInstance);
  }
  if (resources) {
    await module.setResources(resources);
  }

  await module.save();
  await module.reload({
    include: [Language, Demo, Resource],
  });

  return module;
}

async function getModules(): Promise<Module[]> {
  const modules = await Module.findAll({
    include: [Language, Demo, Resource],
  });

  return modules;
}

async function deleteModule(uid: number): Promise<Module | null> {
  const module = await Module.findByPk(uid);
  if (!module) {
    return null;
  }

  await module.destroy();
  return module;
}

export { createModule, getModule, updateModule, getModules, deleteModule };
