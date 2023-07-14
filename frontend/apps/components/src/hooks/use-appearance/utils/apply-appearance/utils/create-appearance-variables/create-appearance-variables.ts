import { FootprintAppearanceVariables } from '@onefootprint/footprint-components-js';

import variablesMap from './constants/variables-map';

export const generateAppearanceVariables = (
  variables: FootprintAppearanceVariables,
) => generateStyles(variables);

const addStyleRow = (options: {
  styles: string;
  cssVariable: string;
  cssValue: string;
}) => {
  const { styles, cssVariable, cssValue } = options;
  return `${styles} ${cssVariable}: ${cssValue};`;
};

const iterateOverVariables = (options: {
  styles: string;
  variables: Record<string, any>;
  tokenName: string;
  tokenValue: string;
}) => {
  let { styles } = options;
  const { variables, tokenName, tokenValue } = options;
  const definitions = variablesMap.get(tokenName);
  if (definitions) {
    const cssVariable = definitions.var;
    styles = addStyleRow({
      styles,
      cssVariable,
      cssValue: tokenValue,
    });
    if (definitions.assignDefault) {
      definitions.assignDefault.forEach(innerTokenName => {
        const shouldOverwrite = !variables.innerTokenName;
        if (shouldOverwrite) {
          styles = iterateOverVariables({
            styles,
            variables,
            tokenName: innerTokenName,
            tokenValue,
          });
        }
      });
    }
    return styles;
  }
  return styles;
};

const generateStyles = (variables: Record<string, any>) => {
  const initialValue = '';
  return Object.entries(variables).reduce(
    (styles, [tokenName, tokenValue]) =>
      iterateOverVariables({ styles, variables, tokenName, tokenValue }),
    initialValue,
  );
};

export default generateAppearanceVariables;
