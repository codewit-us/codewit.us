import { Demo, Language, Module, Resource, sequelize } from '../models';
import { ModuleResponse } from '../typings/response.types';
import { formatModuleResponse } from '../utils/responseFormatter';

async function createModule(
  topic: string,
  language: string,
  resources: number[]
): Promise<ModuleResponse> {
  return sequelize.transaction(async (transaction) => {
    const [languageInstance] = await Language.findOrCreate({
      where: { name: language },
      transaction,
    });

    const demos = await Demo.findAll({
      include: [{ model: Language, where: { uid: languageInstance.uid } }],
      where: { topic },
      transaction,
    });

    // add demos to the module along with language instance
    const module = await Module.create(
      {
        topic,
      },
      { transaction }
    );

    await module.setDemos(demos, { transaction });
    await module.setLanguage(languageInstance, { transaction });

    await module.setResources(resources, { transaction });
    await module.reload({ include: [Language, Demo, Resource], transaction });

    return formatModuleResponse(module);
  });
}

async function getModule(uid: number): Promise<ModuleResponse | null> {
  const module = await Module.findByPk(uid, {
    include: [Language, Demo, Resource],
  });

  return formatModuleResponse(module);
}

async function updateModule(
  uid: number,
  topic?: string,
  language?: string,
  resources?: number[]
): Promise<ModuleResponse> {
  return sequelize.transaction(async (transaction) => {
    const module = await Module.findByPk(uid, {
      include: [Language, Demo, Resource],
      transaction,
    });

    if (!module) {
      return;
    }
    if (topic) {
      module.topic = topic;
    }
    if (language) {
      const [languageInstance] = await Language.findOrCreate({
        where: { name: language },
        transaction,
      });

      await module.setLanguage(languageInstance, { transaction });
    }
    if (resources) {
      await module.setResources(resources, { transaction });
    }

    await module.save({ transaction });

    if (topic || language) {
      await module.reload({
        include: [Language],
        transaction,
      });

      const demos = await Demo.findAll({
        include: [{ model: Language, where: { uid: module.language.uid } }],
        where: { topic: module.topic },
        transaction,
      });

      await module.setDemos(demos, { transaction });
    }

    await module.reload({
      include: [Language, Demo, Resource],
      transaction,
    });

    return formatModuleResponse(module);
  });
}

async function getModules(): Promise<ModuleResponse[]> {
  const modules = await Module.findAll({
    include: [Language, Demo, Resource],
  });

  return formatModuleResponse(modules);
}

async function deleteModule(uid: number): Promise<ModuleResponse | null> {
  const module = await Module.findByPk(uid, {
    include: [Language, Demo, Resource], 
  });
  if (!module) {
    return null;
  }
  const formattedModule = formatModuleResponse(module);
  await module.destroy();
  return formattedModule;
}

export { createModule, getModule, updateModule, getModules, deleteModule };
