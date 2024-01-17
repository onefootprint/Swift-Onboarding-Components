import type { Props, VerifyProps } from '../types/components';
import { ComponentKind } from '../types/components';
import { getEncodedAppearance } from './appearance-utils';
import { getDefaultVariantForKind } from './prop-utils';

export const getWindowUrl = (): string =>
  typeof window !== 'undefined'
    ? window.location?.href || window.location.toString()
    : '';

const getURL = (props: Props, token: string) => {
  const { kind } = props;
  if (kind === ComponentKind.Verify) {
    return getBifrostURL(props, token);
  }
  return getComponentsURL(props, token);
};

const getBifrostURL = (props: VerifyProps, token: string): string => {
  const { appearance, variant, kind, l10n } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const url = process.env.BIFROST_URL;
  const searchParams = new URLSearchParams();

  if (variables) {
    searchParams.append('variables', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  if (l10n?.language) {
    searchParams.append('lng', l10n.language);
  }
  searchParams.append('variant', variant ?? getDefaultVariantForKind(kind));

  const searchParamsStr = searchParams.toString();
  return `${url}?${searchParamsStr}#${token}`;
};

const getComponentsURL = (props: Props, token: string): string => {
  const { appearance, kind, variant, l10n } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const url = process.env.COMPONENTS_URL;
  const searchParams = new URLSearchParams();

  if (variables) {
    searchParams.append('variables', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  if (l10n?.language) {
    searchParams.append('lng', l10n.language);
  }
  searchParams.append('variant', variant ?? getDefaultVariantForKind(kind));

  const searchParamsStr = searchParams.toString();
  return `${url}/${kind}?${searchParamsStr}#${token}`;
};

export default getURL;
