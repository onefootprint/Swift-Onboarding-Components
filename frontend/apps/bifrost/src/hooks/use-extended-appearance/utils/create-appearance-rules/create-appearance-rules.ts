import footprintClassNamesMap from './constants/footprint-class-names-map';
import rulesWhitelist from './constants/rules-whitelist';

const createAppearanceRules = (rules: string) => {
  const parsedRules = getParsedValue(rules);
  if (!parsedRules) return null;
  const filteredRules = filterNonWhitelistRules(parsedRules);
  const styles = createStylesFromRules(filteredRules);
  return styles;
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

export const getParsedValue = (params: string) => {
  try {
    const parsedParams = JSON.parse(decodeURIComponent(params));
    return parsedParams;
  } catch (_) {
    console.warn(
      `Could not parse appearance appearance rules. They will be ignored`,
    );
    return null;
  }
};

export default createAppearanceRules;
