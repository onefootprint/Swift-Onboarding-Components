import type { FootprintAppearanceParams } from '../footprint-js.types';

export const getURL = (params: {
  fontSrc?: string;
  publicKey?: string;
  rules?: string;
  variables?: string;
}) => {
  const url = process.env.BIFROST_URL;
  const { publicKey, variables, rules, fontSrc } = params;
  const searchParams = new URLSearchParams();
  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
  if (variables) {
    searchParams.append('tokens', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  return `${url}?${searchParams.toString()}`;
};

export const getAppearanceStyles = ({
  fontSrc,
  variables = {},
  rules = {},
}: FootprintAppearanceParams = {}) => {
  const {
    fpButtonBorderRadius,
    fpButtonHeight,
    loadingBg,
    loadingBorderRadius,
    loadingColor,
    loadingPadding,
    overlayBg,
    ...remainingStyles
  } = variables;
  const getVariables = () =>
    Object.keys(remainingStyles).length
      ? encodeURIComponent(JSON.stringify(remainingStyles))
      : undefined;

  const getRules = () =>
    Object.keys(rules).length
      ? encodeURIComponent(JSON.stringify(rules))
      : undefined;

  return {
    fontSrc,
    variables: getVariables(),
    rules: getRules(),
  };
};
