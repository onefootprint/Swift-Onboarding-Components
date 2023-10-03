type GenericObj = Record<string, unknown>;

const encode = <T extends GenericObj>(obj?: T): string | undefined => {
  return obj && Object.keys(obj).length
    ? encodeURIComponent(JSON.stringify(obj))
    : undefined;
};

export default encode;
