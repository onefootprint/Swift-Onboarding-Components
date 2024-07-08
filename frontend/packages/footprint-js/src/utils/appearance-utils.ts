import type { Window } from '../@types/global';
import type { Appearance } from '../types/appearance';
import { isObject } from './prop-utils';

export const getEncodedAppearance = ({ fontSrc, variables = {}, rules = {}, variant }: Appearance = {}) => {
  const getVariables = () =>
    Object.keys(variables).length ? encodeURIComponent(JSON.stringify(variables)) : undefined;

  const getRules = () => (Object.keys(rules).length ? encodeURIComponent(JSON.stringify(rules)) : undefined);

  return {
    fontSrc,
    variables: getVariables(),
    rules: getRules(),
    variant,
  };
};

export const getAppearanceForVanilla = (): Appearance => {
  const appearance = (window as Window).footprintAppearance;
  if (!appearance || !isObject(appearance)) {
    return {};
  }
  return {
    fontSrc: appearance.fontSrc,
    rules: appearance.rules,
    theme: appearance.theme,
    variables: appearance.variables,
  };
};
