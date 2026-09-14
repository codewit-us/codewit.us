import 'passport';
import { Attempt, Demo, DemoExercises } from '../models';
import { getDemoAttempt } from './demo';

jest.mock('../models', () => ({
  Attempt: { findAll: jest.fn() },
  Demo: {
    associations: { exercises: 'exercises' },
    findByPk: jest.fn(),
  },
  DemoExercises: 'DemoExercises',
  DemoTags: 'DemoTags',
  Language: 'Language',
  Tag: 'Tag',
  UserExerciseCompletion: 'UserExerciseCompletion',
  User: {},
  sequelize: { query: jest.fn(), transaction: jest.fn() },
}));

describe('GET /demos/:uid/attempt exercise ordering', () => {
  it('returns exercises in their persisted DemoExercises order', async () => {
    jest.mocked(Demo.findByPk).mockImplementation(async (_uid, options) => {
      const order = options?.order as unknown[];
      const hasExerciseOrder = order.some(entry =>
        Array.isArray(entry)
        && entry[0] === 'exercises'
        && entry[1] === DemoExercises
        && entry[2] === 'order'
        && entry[3] === 'ASC'
      );
      const exercises = [
        {
          uid: 1,
          prompt: 'First',
          language: { name: 'cpp' },
          starterCode: '',
          DemoExercises: { order: 1 },
        },
        {
          uid: 2,
          prompt: 'Second',
          language: { name: 'cpp' },
          starterCode: '',
          DemoExercises: { order: 0 },
        },
      ];

      return {
        uid: 9,
        title: 'Ordered demo',
        topic: 'operation',
        language: { name: 'cpp' },
        youtube_id: 'video',
        youtube_thumbnail: 'thumbnail',
        tags: [],
        exercises: hasExerciseOrder
          ? exercises.sort((left, right) =>
              left.DemoExercises.order - right.DemoExercises.order
            )
          : exercises,
        hasLikedBy: jest.fn().mockResolvedValue(false),
      } as never;
    });
    jest.mocked(Attempt.findAll).mockResolvedValue([]);
    const json = jest.fn();
    const response = {
      json,
      status: jest.fn().mockReturnThis(),
    };

    await getDemoAttempt(
      {
        params: { uid: '9' },
        query: {},
        user: { uid: 4 },
      } as never,
      response as never,
      jest.fn(),
    );

    expect(json.mock.calls[0][0].demo.exercises.map(
      (exercise: { uid: number }) => exercise.uid
    )).toEqual([2, 1]);
  });
});
