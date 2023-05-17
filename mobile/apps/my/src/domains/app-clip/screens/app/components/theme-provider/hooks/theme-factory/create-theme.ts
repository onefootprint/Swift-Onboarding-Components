import themes, { Theme } from '@onefootprint/design-tokens';
import set from 'lodash/set';

import { FootprintAppearance } from '../../theme.types';
import variablesMap from './constants/variables-map';

export const parseAppearance = (params: string) => {
  try {
    return JSON.parse(params);
  } catch (_) {}
  return null;
};

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
  variables: Record<string, any>;
  tokenName: string;
  tokenValue: any;
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

export const generateTokens = (
  appearance: FootprintAppearance,
  baseTheme: Theme,
): Theme => {
  const { variables } = appearance;
  if (!variables || Object.keys(variables).length === 0) return baseTheme;
  return Object.entries(variables).reduce((theme, [tokenName, tokenValue]) => {
    return iterateOverVariables({ theme, variables, tokenName, tokenValue });
  }, baseTheme);
};

const createTheme = (appearanceAsString: string): Theme => {
  const appearance = parseAppearance(appearanceAsString);
  if (!appearance) return themes.light;
  return generateTokens(appearance, themes.light);
};

export default createTheme;
