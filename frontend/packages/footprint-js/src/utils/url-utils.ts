import type { Props } from '../types/components';
import { ComponentKind } from '../types/components';
import { getEncodedAppearance } from './appearance-utils';
import { getDefaultVariantForKind } from './prop-utils';

const isAuth = (x: unknown) => x === ComponentKind.Auth;
const isVerify = (x: unknown) => x === ComponentKind.Verify;
const isValidString = (x: unknown) => typeof x === 'string' && x.length > 0;

export const getWindowUrl = (): string =>
  typeof window !== 'undefined'
    ? window.location?.href || window.location.toString()
    : '';

const getSearchParams = (props: Props, token: string): string => {
  const { appearance, kind, l10n, variant } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const searchParams = new URLSearchParams();

  if (variables) searchParams.append('variables', variables);
  if (rules) searchParams.append('rules', rules);
  if (fontSrc) searchParams.append('font_src', fontSrc);
  if (l10n?.language) searchParams.append('lng', l10n.language);

  searchParams.append('variant', variant || getDefaultVariantForKind(kind));

  return `${searchParams.toString()}#${token}`;
};

const getURL = (props: Props, token: string): string => {
  const { kind } = props;
  let url: string | undefined;

  switch (kind) {
    case ComponentKind.Verify:
      url = process.env.BIFROST_URL;
      break;
    case ComponentKind.Auth:
      url = process.env.AUTH_URL;
      break;
    default:
      url = process.env.COMPONENTS_URL;
  }

  if (isValidString(url)) {
    return isVerify(kind) || isAuth(kind)
      ? `${url}?${getSearchParams(props, token)}`.trim()
      : `${url}/${kind}?${getSearchParams(props, token)}`.trim();
  }

  throw new Error(`${kind}_URL environment variable is not defined.`);
};

export default getURL;
