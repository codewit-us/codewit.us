import { moveArrayItem } from './arrayOrder';

describe('moveArrayItem', () => {
  it('moves the dragged item to the target position without mutating the input', () => {
    const original = ['first', 'second', 'third'];

    expect(moveArrayItem(original, 2, 0)).toEqual(['third', 'first', 'second']);
    expect(original).toEqual(['first', 'second', 'third']);
  });
});
