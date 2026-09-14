import {
  Demo,
  Language,
  Module,
  ModuleResources,
  Resource,
  sequelize,
} from '../models';
import { createModule, getModule, updateModule } from './module';

jest.mock('../models', () => ({
  Demo: { findAll: jest.fn() },
  Language: { findOrCreate: jest.fn() },
  Module: {
    associations: { resources: 'resources' },
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  ModuleResources: {
    bulkCreate: jest.fn(),
    destroy: jest.fn(),
  },
  Resource: {},
  sequelize: {
    transaction: jest.fn(async (
      callback: (transaction: object) => Promise<unknown>,
    ) => callback({})),
  },
}));

const resource = (uid: number) => ({
  get: () => ({
    uid,
    title: `Resource ${uid}`,
    url: `https://example.com/${uid}`,
    source: 'Example',
    likes: 0,
  }),
});

const makeModule = () => ({
  uid: 12,
  topic: 'operation',
  language: { name: 'cpp' },
  demos: [],
  resources: [resource(3), resource(1)],
  setDemos: jest.fn(),
  setLanguage: jest.fn(),
  reload: jest.fn(),
  save: jest.fn(),
});

describe('module resource ordering', () => {
  const transaction = {};

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Language.findOrCreate).mockResolvedValue([{ uid: 4 }] as never);
    jest.mocked(Demo.findAll).mockResolvedValue([]);
  });

  it('persists submitted resource order when creating a module', async () => {
    const module = makeModule();
    jest.mocked(Module.create).mockResolvedValue(module as never);

    const created = await createModule('operation', 'cpp', [3, 1]);

    expect(ModuleResources.bulkCreate).toHaveBeenCalledWith(
      [
        { moduleUid: 12, resourceUid: 3, ordering: 0 },
        { moduleUid: 12, resourceUid: 1, ordering: 1 },
      ],
      { transaction },
    );
    expect(module.reload).toHaveBeenCalledWith(expect.objectContaining({
      order: [['resources', ModuleResources, 'ordering', 'ASC']],
    }));
    expect(created.resources.map(({ uid }) => uid)).toEqual([3, 1]);
  });

  it('replaces persisted resource order when updating a module', async () => {
    const module = makeModule();
    jest.mocked(Module.findByPk).mockResolvedValue(module as never);

    const updated = await updateModule(12, undefined, undefined, [3, 1]);

    expect(ModuleResources.destroy).toHaveBeenCalledWith({
      where: { moduleUid: 12 },
      transaction,
    });
    expect(ModuleResources.bulkCreate).toHaveBeenCalledWith(
      [
        { moduleUid: 12, resourceUid: 3, ordering: 0 },
        { moduleUid: 12, resourceUid: 1, ordering: 1 },
      ],
      { transaction },
    );
    expect(updated.resources.map(({ uid }) => uid)).toEqual([3, 1]);
  });

  it('requests persisted resource order when retrieving a module', async () => {
    const module = makeModule();
    jest.mocked(Module.findByPk).mockResolvedValue(module as never);

    const retrieved = await getModule(12);

    expect(Module.findByPk).toHaveBeenCalledWith(12, expect.objectContaining({
      order: [['resources', ModuleResources, 'ordering', 'ASC']],
    }));
    expect(retrieved?.resources.map(({ uid }) => uid)).toEqual([3, 1]);
  });
});
