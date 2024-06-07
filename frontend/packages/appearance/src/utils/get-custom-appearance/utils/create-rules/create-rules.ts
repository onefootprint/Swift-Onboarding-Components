import type { FootprintAppearanceRules } from '@onefootprint/footprint-js';

import footprintClassNamesMap from './constants/footprint-class-names-map';
import rulesWhitelist from './constants/rules-whitelist';

const createRules = (rules?: FootprintAppearanceRules) => {
  if (!rules || Object.keys(rules).length === 0) return null;
  const filteredRules = filterNonWhitelistRules(rules);
  const styles = createStylesFromRules(filteredRules);
  return styles;
};

export const filterNonWhitelistRules = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  rules: Record<string, any>,
  whitelist: string[] = rulesWhitelist,
) => {
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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const convertObjectToCSS = (rules: Record<string, any>) => {
  const toKebabCase = (selector: string) =>
    selector
      .split(/(?=[A-Z])/)
      .join('-')
      .toLowerCase();
  const formatValue = (selector: string, value: string) => {
    if (selector === 'content') {
      return `"${value}"`;
    }
    return value;
  };

  return Object.keys(rules).reduce(
    (acc, selector) => `${acc + toKebabCase(selector)}:${formatValue(selector, rules[selector])};`,
    '',
  );
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const createStylesFromRules = (rules: Record<string, any>) => {
  let styles = ` `;
  Object.entries(rules).forEach(([selector, stylesObject]) => {
    const fpSelector = getSelector(selector);
    const css = convertObjectToCSS(stylesObject);
    styles = `${styles}${fpSelector}{${css}} `;
  });
  return styles.trim();
};

export default createRules;
