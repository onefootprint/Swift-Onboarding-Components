import type { Props } from '../types/components';
import { ComponentKind } from '../types/components';
import { getEncodedAppearance } from './appearance-utils';
import { getDefaultVariantForKind } from './prop-utils';
import {
  isAuthOrVerifyOrUpdateLogin,
  isUpdateLoginMethods,
  isValidString,
} from './type-guards';

/** @deprecated: import from `@onefootprint/core` */
export const getWindowUrl = (): string =>
  typeof window !== 'undefined'
    ? window.location?.href || window.location.toString()
    : '';

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

const getURL = (props: Props, token: string): string => {
  const { kind } = props;
  let url: string | undefined;

  switch (kind) {
    case ComponentKind.Verify:
    case ComponentKind.Components:
      url = process.env.BIFROST_URL;
      break;
    case ComponentKind.Auth:
      url = isUpdateLoginMethods(props)
        ? `${process.env.AUTH_URL}/user`
        : process.env.AUTH_URL;
      break;
    default:
      url = process.env.COMPONENTS_URL;
  }

  if (isValidString(url)) {
    return isAuthOrVerifyOrUpdateLogin(kind)
      ? `${url}?${getSearchParams(props, token)}`.trim()
      : `${url}/${kind}?${getSearchParams(props, token)}`.trim();
  }

  throw new Error(`${kind}_URL environment variable is not defined.`);
};

export default getURL;
