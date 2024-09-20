/**
 * Validates if a given string matches a specific token format.
 *
 * Note: This validation does not mandate that the string must start with 'tok_'.
 * It allows for flexibility in token prefixes, acknowledging that tokens can have various prefixes.
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} - True if the string matches the token format, false otherwise.
 */
const isTokenFormat = (str?: string): str is string => typeof str === 'string' && /tok_/.test(str);

export default isTokenFormat;
