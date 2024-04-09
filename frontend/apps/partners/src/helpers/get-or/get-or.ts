type Obj = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const isObject = (x: unknown): x is Obj => typeof x === 'object' && !!x;

const getOr =
  <Override>(fallback: Override, strWithDots: string) =>
  (obj: Obj): Override => {
    if (!isObject(obj) || !strWithDots) return fallback;

    return strWithDots.split('.').reduce((it, key) => {
      if (it == null) return fallback;
      return it[key];
    }, obj) as Override;
  };

export default getOr;
