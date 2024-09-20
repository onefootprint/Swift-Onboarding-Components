import isTokenFormat from '../../validations/is-token-format';

/**
 * Extracts a token from the URL hash fragment if it exists and is in a valid format.
 *
 * This function looks for a hash fragment in the provided URL and checks if that fragment
 * matches a predefined format for tokens using the `isTokenFormat` validation function.
 * If a valid token is found, it is returned; otherwise, the function returns `undefined`.
 *
 * @param url The URL string from which to extract the token.
 * @returns The extracted token if it exists in the URL and is valid, or `undefined` otherwise.
 */
const getTokenFromUrlHash = (url: string): string | undefined => {
  if (!url || !url.includes('#')) {
    return undefined;
  }

  const urlFragment = url.split('#')[1];

  if (!urlFragment || !isTokenFormat(urlFragment)) {
    return undefined;
  }

  return urlFragment;
};

export default getTokenFromUrlHash;
