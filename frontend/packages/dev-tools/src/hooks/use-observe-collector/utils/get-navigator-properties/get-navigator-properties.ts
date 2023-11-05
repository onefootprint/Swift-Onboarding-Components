const getNavigatorProperties = () => {
  const properties: Record<string, unknown[]> = {};
  if (typeof navigator === 'undefined') {
    return properties;
  }
  const nav: Navigator = navigator;
  // Navigator cannot be iterated using 'of' or Object.keys
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in nav) {
    // @ts-ignore Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Navigator'...
    const value = nav[key];
    if (typeof value !== 'function') {
      properties[key] = value;
    }
  }
  return properties;
};

export default getNavigatorProperties;
