const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const fixKeys = (fn: Function) => (obj: unknown) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const entries: unknown[][] = Object.entries(obj).map(([k, v]) => {
    let value;
    if (Array.isArray(v)) {
      value = v.map(fixKeys(fn));
    } else if (Object(v) === v) {
      value = fixKeys(fn)(v);
    } else {
      value = v;
    }

    const entry = [fn(k), value];
    return entry;
  });

  return Object.fromEntries(entries);
};

const transformKeys = fixKeys(camelToSnakeCase);

export default transformKeys;
