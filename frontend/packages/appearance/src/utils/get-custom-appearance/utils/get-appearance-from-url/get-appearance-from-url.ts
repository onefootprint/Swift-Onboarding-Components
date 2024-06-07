import type { FootprintAppearance } from '@onefootprint/footprint-js';

import parse from '../parse';

const getAppearanceFromUrl = (params: Record<string, string | undefined>): FootprintAppearance | null => {
  const { font_src: fontSrc, variables, rules, variant } = params;
  if (!variables && !rules) {
    return null;
  }
  const appearance = {
    variant: variant || null,
    fontSrc: fontSrc || null,
    rules: rules ? parse(rules) : null,
    variables: variables ? parse(variables) : null,
  } as FootprintAppearance;
  return appearance;
};

export default getAppearanceFromUrl;
