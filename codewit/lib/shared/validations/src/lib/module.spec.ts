import { createModuleSchema, updateModuleSchema } from './module';

describe('module resource validation', () => {
  it('rejects duplicate resource IDs when creating a module', () => {
    const result = createModuleSchema.safeParse({
      topic: 'operation',
      language: 'cpp',
      resources: [1, 1],
    });

    expect(result.success).toBe(false);
  });

  it('rejects duplicate resource IDs when updating a module', () => {
    const result = updateModuleSchema.safeParse({ resources: [2, 2] });

    expect(result.success).toBe(false);
  });
});
