export function moveArrayItem<T>(
  values: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const reordered = [...values];
  const [item] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, item);

  return reordered;
}
