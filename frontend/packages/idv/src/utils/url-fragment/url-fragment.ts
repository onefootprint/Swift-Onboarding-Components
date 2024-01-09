const hasEncodedOpenBrackets = (str: string): boolean =>
  Boolean(str) && /%7B/g.test(str);

export const isValidTokenFormat = (str: string): boolean =>
  Boolean(str) && /^tok_/.test(str);

export const getSdkArgsToken = (str: string): string =>
  isValidTokenFormat(str) ? str : '';

/**
 * @returns {Boolean}
 * @example
 * - Fails when path contains "#" AND (NOT followed by "tok_" AND NOT followed by any "{")
 */
export const hasInvalidHashFragment = (path: string): boolean => {
  if (!path.includes('#')) return false;

  const part = path.split('#')[1] ?? '';
  return !isValidTokenFormat(part) && !hasEncodedOpenBrackets(part);
};
