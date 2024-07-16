import type { Theme } from '@onefootprint/design-tokens';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import variablesMap from './constants/variables-map';
import type { FootprintAppearanceVariables } from './theme.types';

const mutateTheme = (options: {
  theme: Theme;
  cssVariable: string;
  cssValue: string;
}) => {
  const { theme, cssVariable, cssValue } = options;
  set(theme, cssVariable, cssValue);
  return theme;
};

const iterateOverVariables = (options: {
  theme: Theme;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  variables: Record<string, any>;
  tokenName: string;
  tokenValue: string;
}) => {
  let { theme } = options;
  const { variables, tokenName, tokenValue } = options;
  const definitions = variablesMap.get(tokenName);
  if (definitions) {
    const cssVariable = definitions.var;
    theme = mutateTheme({
      theme,
      cssVariable,
      cssValue: tokenValue,
    });
    if (definitions.assignDefault) {
      definitions.assignDefault.forEach(innerTokenName => {
        const shouldOverwrite = !variables.innerTokenName;
        if (shouldOverwrite) {
          theme = iterateOverVariables({
            theme,
            variables,
            tokenName: innerTokenName,
            tokenValue,
          });
        }
      });
    }
    return theme;
  }
  return theme;
};

export const createTokens = (baseTheme: Theme, variables: FootprintAppearanceVariables): Theme => {
  if (!variables || Object.keys(variables).length === 0) return baseTheme;
  return Object.entries(variables).reduce((theme, [tokenName, tokenValue]) => {
    return iterateOverVariables({ theme, variables, tokenName, tokenValue });
  }, baseTheme);
};

const createTheme = (baseTheme: Theme, styleParams: string = ''): Theme => {
  if (!styleParams) return baseTheme;
  const appearance = parseUriComponent(styleParams);
  if (!appearance) return baseTheme;
  return createTokens(cloneDeep(baseTheme), appearance.variables);
};

const parseUriComponent = (params: string) => {
  try {
    const parsedParams = JSON.parse(decodeURIComponent(params));
    return parsedParams;
  } catch (_) {
    return null;
  }
};

export default createTheme;
