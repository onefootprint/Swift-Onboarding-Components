import type { Props } from '../types/components';
import { ComponentKind } from '../types/components';
import { getEncodedAppearance } from './appearance-utils';
import { getDefaultVariantForKind } from './prop-utils';
import { isValidString } from './type-guards';

export const getWindowUrl = (): string =>
  typeof window !== 'undefined' ? window.location?.href || window.location.toString() : '';

export const getSearchParams = (props: Props, token: string): string => {
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

const getURL = (props: Props, token: string) => {
  const { kind } = props;
  const searchParams = getSearchParams(props, token);
  let url = `${process.env.COMPONENTS_URL}/${kind}`;
  let fallbackUrl = `${process.env.COMPONENTS_FALLBACK_URL}/${kind}`;

  if (kind === ComponentKind.UpdateLoginMethods) {
    url = `${process.env.AUTH_URL}/user`;
    fallbackUrl = `${process.env.AUTH_FALLBACK_URL}/user`;
  }
  if (kind === ComponentKind.Auth) {
    url = process.env.AUTH_URL as string;
    fallbackUrl = process.env.AUTH_FALLBACK_URL as string;
  }
  if (kind === ComponentKind.Verify || kind === ComponentKind.VerifyButton || kind === ComponentKind.Components) {
    url = process.env.BIFROST_URL as string;
    fallbackUrl = process.env.BIFROST_FALLBACK_URL as string;
  }
  if (!isValidString(url)) {
    throw new Error(`${kind}_URL environment variable is not defined.`);
  }

  url += `?${searchParams}`.trim();
  fallbackUrl += `?${searchParams}`.trim();

  return {
    url,
    fallbackUrl,
  };
};

export default getURL;
