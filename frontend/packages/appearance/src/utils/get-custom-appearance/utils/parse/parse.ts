const parse = (params: string) => {
  try {
    const parsed = JSON.parse(decodeURIComponent(params));
    return parsed;
  } catch (_) {
    console.warn('Could not parse appearance rules. They will be ignored.');
    return null;
  }
};

export default parse;
