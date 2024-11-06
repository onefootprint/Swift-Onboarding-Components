import type { FootprintAppearanceRules } from '@onefootprint/footprint-js';

import footprintClassNamesMap from './constants/footprint-class-names-map';
import rulesWhitelist from './constants/rules-whitelist';

type CSSProperties = Record<string, string | number>;
type StyleRules = Record<string, CSSProperties>;

const createRules = (rules?: Partial<FootprintAppearanceRules>) => {
  if (!rules || Object.keys(rules).length === 0) return null;
  const filteredRules = filterNonWhitelistRules(rules as StyleRules);
  const styles = createStylesFromRules(filteredRules);
  return styles;
};

export const filterNonWhitelistRules = (rules: StyleRules, whitelist: string[] = rulesWhitelist): StyleRules => {
  const clonedRules = { ...rules };
  Object.entries(rules).forEach(([rule]) => {
    if (!whitelist.includes(rule)) {
      delete clonedRules[rule];
    }
  });
  return clonedRules;
};

export const getSelector = (selector: string, selectors: Record<string, string> = footprintClassNamesMap) => {
  if (selector.includes(':')) {
    const separatorPosition = selector.indexOf(':');
    const component = selector.slice(0, separatorPosition);
    const pseudoSelector = selector.slice(separatorPosition, selector.length);
    return `.fp-custom-appearance${selectors[component]}${pseudoSelector}`;
  }
  return `.fp-custom-appearance${selectors[selector]}`;
};

export const convertObjectToCSS = (rules: CSSProperties): string => {
  const toKebabCase = (selector: string) =>
    selector
      .split(/(?=[A-Z])/)
      .join('-')
      .toLowerCase();
  const formatValue = (selector: string, value: string | number): string => {
    if (selector === 'content') {
      return `"${value}"`;
    }
    return value as string;
  };

  return Object.entries(rules).reduce(
    (acc, [selector, value]) => `${acc + toKebabCase(selector)}:${formatValue(selector, String(value))};`,
    '',
  );
};

export const createStylesFromRules = (rules: StyleRules): string => {
  let styles = ' ';
  Object.entries(rules).forEach(([selector, stylesObject]) => {
    const fpSelector = getSelector(selector);
    const css = convertObjectToCSS(stylesObject);
    styles = `${styles}${fpSelector}{${css}} `;
  });
  return styles.trim();
};

export default createRules;
