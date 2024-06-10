import type { Theme } from '@onefootprint/design-tokens';
import type { FootprintAppearanceVariables } from '@onefootprint/footprint-js';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import variablesMap from './constants/variables-map';

export const createTheme = (baseTheme: Theme, variables?: FootprintAppearanceVariables): Theme => {
  const clonedBasedTheme = cloneDeep(baseTheme);
  if (!variables || Object.keys(variables).length === 0) return clonedBasedTheme;
  return Object.entries(variables).reduce(
    (theme, [tokenName, tokenValue]) => iterateOverVariables({ theme, variables, tokenName, tokenValue }),
    clonedBasedTheme,
  );
};

const mutateTheme = (options: { theme: Theme; key: string; value: string }) => {
  const { theme, key, value } = options;
  set(theme, key, value);
  return theme;
};

const iterateOverVariables = (options: {
  theme: Theme;
  variables: Record<string, unknown>;
  tokenName: string;
  tokenValue: unknown;
}) => {
  let { theme } = options;
  const { variables, tokenName, tokenValue } = options;
  const definitions = variablesMap.get(tokenName);
  if (definitions) {
    const key = definitions.var;
    theme = mutateTheme({
      theme,
      key,
      value: tokenValue as string,
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

export default createTheme;
