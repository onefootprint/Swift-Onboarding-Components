import variablesMap from './constants/variables-map';

export const generateAppearanceVariables = (tokens: Record<string, any>) => {
  const initialValue = '';
  return Object.entries(tokens).reduce(
    (styles, [tokenName, tokenValue]) =>
      iterateOverTokens({ styles, tokens, tokenName, tokenValue }),
    initialValue,
  );
};

const addStyleRow = (options: {
  styles: string;
  cssVariable: string;
  cssValue: string;
}) => {
  const { styles, cssVariable, cssValue } = options;
  return `${styles} ${cssVariable}: ${cssValue};`;
};

const iterateOverTokens = (options: {
  styles: string;
  tokens: Record<string, any>;
  tokenName: string;
  tokenValue: string;
}) => {
  let { styles } = options;
  const { tokens, tokenName, tokenValue } = options;
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
        const shouldOverwrite = !tokens.innerTokenName;
        if (shouldOverwrite) {
          styles = iterateOverTokens({
            styles,
            tokens,
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

export const getParsedValue = (params: string) => {
  try {
    const parsedParams = JSON.parse(decodeURIComponent(params));
    return parsedParams;
  } catch (_) {
    console.warn(`Could not parse appearance variables. They will be ignored`);
    return null;
  }
};

export default generateAppearanceVariables;
