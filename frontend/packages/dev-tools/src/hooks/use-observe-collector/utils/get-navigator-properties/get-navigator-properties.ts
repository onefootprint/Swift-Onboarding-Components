const getNavigatorProperties = () => {
  const properties: Record<string, any[]> = {};
  if (typeof navigator === 'undefined') {
    return properties;
  }
  const nav: any = navigator;
  // Navigator cannot be iterated using 'of' or Object.keys
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const key in nav) {
    const value = nav[key];
    if (typeof value !== 'function') {
      properties[key] = value;
    }
  }
  return properties;
};

export default getNavigatorProperties;
