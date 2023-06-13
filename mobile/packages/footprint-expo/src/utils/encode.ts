const encode = (obj: object) =>
  Object.keys(obj).length ? encodeURIComponent(JSON.stringify(obj)) : undefined;

export default encode;
