import getOr from '../get-or/get-or';

/**
 * Generates a string of dot-separated paths for each nested key in the provided
 * object.
 *
 * @template T - The type of object to generate paths for.
 * @param {T} obj - The object to generate paths for.
 * @returns {string} - A string of dot-separated paths.
 */
type StringPathOf<T> = T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}${StringPathOf<NonNullable<T[K]>> extends '' ? '' : '.'}${StringPathOf<NonNullable<T[K]>>}`
        : never;
    }[keyof T]
  : '';

function searchByPaths<Data extends Record<string, unknown>>(paths: StringPathOf<Data>[]) {
  return (list: Data[], searchStr: string): Data[] => {
    if (!searchStr || list.length < 2) return list;
    const rExp = new RegExp(searchStr, 'i');
    return list.filter(x => paths.some(path => rExp.test(getOr('', path)(x))));
  };
}

export default searchByPaths;
