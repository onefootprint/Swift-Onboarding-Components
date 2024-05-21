import type { FootprintVerifyDataProps } from '@onefootprint/footprint-js';
import { Logger } from '@onefootprint/idv';

const FRAGMENT_DIVIDER = '__';

const getParsedProps = (
  props?: string,
): Record<string, unknown> | undefined => {
  if (!props) {
    return undefined;
  }
  let parsedProps;
  try {
    parsedProps = JSON.parse(decodeURIComponent(props));
  } catch (_) {
    Logger.warn(`Could not parse props from url. They will be ignored.`, {
      location: 'bifrost-use-props',
    });
  }

  return parsedProps;
};

// TODO: delete after all customers migrate to 1.4.0+ for mobile sdks
/**
 * Extract Bifrost properties from a encoded URL string
 * @param {String} path We expect URLs to be formatted like this: <URL_BASE>#<ENCODED_USER_DATA>__<ENCODED_OPTIONS>__<ENCODED_L10N>
 * @returns {BifrostProps | undefined} BifrostProps | undefined
 */
const getMobilePropsFromUrl = (
  path: string,
): Partial<FootprintVerifyDataProps> | undefined => {
  const parts = path.split('#');
  if (parts.length < 2) {
    return undefined;
  }

  const fragment = parts[1];
  const [part1, part2, part3] = fragment.split(FRAGMENT_DIVIDER);

  const userData = getParsedProps(part1);
  const options = getParsedProps(part2);
  const l10n = getParsedProps(part3);
  if (!userData && !options && !l10n) {
    return undefined;
  }

  return {
    // @ts-ignore
    userData: getParsedProps(part1),
    options: getParsedProps(part2),
    l10n: getParsedProps(part3),
    authToken: undefined,
  };
};

export default getMobilePropsFromUrl;
