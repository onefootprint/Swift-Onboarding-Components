const getParsedApperanceField = (params: string) => {
  try {
    const parsed = JSON.parse(decodeURIComponent(params));
    return parsed;
  } catch (_) {
    console.warn(`Could not parse appearance rules. They will be ignored.`);
    return null;
  }
};
const parseAppearance = (asPath: string, pathName?: string) => {
  // Extract any pthname before the query string
  let params = asPath;
  if (pathName) {
    const parts = params.split(pathName);
    if (parts.length > 1) {
      [, params] = parts;
    }
  }

  const searchParams = new URLSearchParams(params);
  const fontSrc = searchParams.get('font_src') ?? undefined;
  const variables = searchParams.get('tokens') ?? undefined;
  const rules = searchParams.get('rules') ?? undefined;

  if (!fontSrc && !variables && !rules) {
    return {};
  }

  const appearance = {
    fontSrc,
    rules: rules ? getParsedApperanceField(rules) : undefined,
    variables: variables ? getParsedApperanceField(variables) : undefined,
  };

  return appearance;
};

export default parseAppearance;
