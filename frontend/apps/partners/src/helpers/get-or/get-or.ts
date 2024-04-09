const isObject = (x: unknown): x is object => typeof x === 'object' && !!x;

const getOr =
  <Override>(fallback: Override, strWithDots: string) =>
  (obj: object): Override => {
    if (!isObject(obj) || !strWithDots) return fallback;

    const keys = strWithDots.split('.');
    let acc: object = obj;

    for (const key of keys) {
      if (acc == null) return fallback;
      acc = acc[key as keyof typeof acc];
    }

    return acc as Override;
  };

export default getOr;
