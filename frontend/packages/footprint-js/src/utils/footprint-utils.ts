import type { FootprintAppearance } from '../footprint-js.types';

export const getURL = (params: {
  fontSrc?: string;
  publicKey?: string;
  rules?: string;
  variant?: string;
  variables?: string;
}) => {
  const url = process.env.BIFROST_URL;
  const { publicKey, variables, rules, fontSrc, variant } = params;
  const searchParams = new URLSearchParams();
  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
  if (variables) {
    searchParams.append('variables', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (variant) {
    searchParams.append('variant', variant);
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
  variant,
}: FootprintAppearance = {}) => {
  const getVariables = () =>
    Object.keys(variables).length
      ? encodeURIComponent(JSON.stringify(variables))
      : undefined;

  const getRules = () =>
    Object.keys(rules).length
      ? encodeURIComponent(JSON.stringify(rules))
      : undefined;

  return {
    fontSrc,
    variables: getVariables(),
    rules: getRules(),
    variant,
  };
};
