import { ComponentKind, Props, VerifyProps } from '../types/components';
import { getEncodedAppearance } from './appearance-utils';
import { getDefaultVariantForKind } from './prop-utils';

// TODO: (belce) in the future combine these onto the same app?
const getURL = (props: Props) => {
  const { kind } = props;
  if (kind === ComponentKind.Verify) {
    return getBifrostURL(props);
  }
  return getComponentsURL(props);
};

const getBifrostURL = (props: VerifyProps) => {
  const { appearance, publicKey, variant, kind } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const url = process.env.BIFROST_URL;
  const searchParams = new URLSearchParams();

  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
  if (variables) {
    searchParams.append('variables', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  searchParams.append('variant', variant ?? getDefaultVariantForKind(kind));

  const searchParamsStr = searchParams.toString();
  return `${url}?${searchParamsStr}`;
};

const getComponentsURL = (props: Props) => {
  const { appearance, kind, variant } = props;
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
  searchParams.append('variant', variant ?? getDefaultVariantForKind(kind));

  const searchParamsStr = searchParams.toString();
  return `${url}/${kind}?${searchParamsStr}`;
};

export default getURL;
