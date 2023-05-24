import { FootprintAppearanceRules } from '@onefootprint/footprint-js';

import footprintClassNamesMap from './constants/footprint-class-names-map';
import rulesWhitelist from './constants/rules-whitelist';

// if fixContainerSizeAndPosition provided, the following CSS rules and
// selectors are blacklisted to preserve the original layout
const BLACKLISTED_CONTAINER_SIZE_SELECTORS = new Set([
  'height',
  'minHeight',
  'maxHeight',
  'width',
  'minWidth',
  'maxWidth',
  'top',
  'bottom',
  'left',
  'right',
  'position',
  'margin',
  'overflow',
]);

const BLACKLISTED_CONTAINER_POSITION_RULES: Record<string, string[]> = {
  margin: ['auto', 'unset', 'inherit'],
  display: ['none'],
};

const createAppearanceRules = (
  rules: FootprintAppearanceRules,
  fixContainerSizeAndPosition?: boolean,
) => {
  let filteredRules = rules;
  if (fixContainerSizeAndPosition) {
    filteredRules = filterContainerSizeRules(rules);
  }
  filteredRules = filterNonWhitelistRules(filteredRules);
  const styles = createStylesFromRules(filteredRules);
  return styles;
};

const filterContainerSizeRules = (rules: FootprintAppearanceRules) => {
  const containerRules = rules.container;
  if (!containerRules) {
    return rules;
  }

  const withoutContainerSize = Object.entries(containerRules).filter(
    ([key, value]) => {
      if (BLACKLISTED_CONTAINER_SIZE_SELECTORS.has(key)) {
        return false;
      }
      if (key in BLACKLISTED_CONTAINER_POSITION_RULES) {
        const blackListedValues = BLACKLISTED_CONTAINER_POSITION_RULES[key];
        return !blackListedValues.includes(value);
      }
      return true;
    },
  );
  const fileredContainerRules = Object.fromEntries(withoutContainerSize);

  return {
    ...rules,
    container: fileredContainerRules,
  };
};

export const filterNonWhitelistRules = (
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

export const getSelector = (
  selector: string,
  selectors: Record<string, string> = footprintClassNamesMap,
) => {
  if (selector.includes(':')) {
    const separatorPosition = selector.indexOf(':');
    const component = selector.slice(0, separatorPosition);
    const pseudoSelector = selector.slice(separatorPosition, selector.length);
    return `${selectors[component]}${pseudoSelector}`;
  }
  return selectors[selector];
};

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
    (acc, selector) =>
      `${acc + toKebabCase(selector)}:${formatValue(
        selector,
        rules[selector],
      )};`,
    '',
  );
};

export const createStylesFromRules = (rules: Record<string, any>) => {
  let styles = ` `;
  Object.entries(rules).forEach(([selector, stylesObject]) => {
    const fpSelector = getSelector(selector);
    const css = convertObjectToCSS(stylesObject);
    styles = `${styles}${fpSelector}{${css}} `;
  });
  return styles.trim();
};

export default createAppearanceRules;
