import type { FootprintAppearance } from '../types';
import { FootprintComponentKind } from '../types';

export const getURL = (
  kind: FootprintComponentKind,
  params: {
    fontSrc?: string;
    rules?: string;
    variables?: string;
  },
) => {
  const url = process.env.COMPONENTS_URL;
  const { variables, rules, fontSrc } = params;
  const searchParams = new URLSearchParams();
  if (variables) {
    searchParams.append('tokens', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  const searchParamsStr = searchParams.toString();
  if (!searchParamsStr) {
    return `${url}${kind}`;
  }
  return `${url}${kind}?${searchParams.toString()}`;
};

export const getAppearanceStyles = ({
  fontSrc,
  variables = {},
  rules = {},
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
  };
};
