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

const getKeys = (o: Record<string, unknown>, prefix = ''): string[] => {
  return Object.entries(o).flatMap(([key, value]) => {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return getKeys(value as Record<string, unknown>, currentKey);
    }
    return value ? [currentKey] : [];
  });
};

export const getNonEmptyKeys = (obj: Record<string, unknown>): string => {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  return getKeys(obj).join(', ');
};

export default transformKeys;
