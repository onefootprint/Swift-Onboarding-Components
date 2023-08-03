import {
  ComponentKind,
  Props,
  Variant,
  VerifyButtonProps,
  VerifyProps,
} from '../types/components';
import { getEncodedAppearance } from './appearance-utils';

// TODO: (belce) in the future combine these onto the same app?
const getURL = (props: Props) => {
  const { kind } = props;
  if (kind === ComponentKind.Verify || kind === ComponentKind.VerifyButton) {
    return getBifrostURL(props);
  }
  return getComponentsURL(props);
};

const getVariantName = (variant?: Variant) => {
  if (!variant) {
    return 'modal';
  }
  if (variant === 'modal' || variant === 'drawer') {
    return variant;
  }
  return 'inline';
};

const getBifrostURL = (props: VerifyProps | VerifyButtonProps) => {
  const { appearance, publicKey, variant } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const url = process.env.BIFROST_URL;
  const searchParams = new URLSearchParams();

  if (publicKey) {
    searchParams.append('public_key', publicKey);
  }
  if (variables) {
    searchParams.append('tokens', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  if (variant) {
    searchParams.append('variant', getVariantName(variant));
  }

  const searchParamsStr = searchParams.toString();
  if (!searchParamsStr) {
    return `${url}`;
  }
  return `${url}?${searchParamsStr}`;
};

const getComponentsURL = (props: Props) => {
  const { appearance, kind, variant } = props;
  const { fontSrc, rules, variables } = getEncodedAppearance(appearance);
  const url = process.env.COMPONENTS_URL;
  const searchParams = new URLSearchParams();

  if (variables) {
    searchParams.append('tokens', variables);
  }
  if (rules) {
    searchParams.append('rules', rules);
  }
  if (fontSrc) {
    searchParams.append('font_src', fontSrc);
  }
  if (variant) {
    searchParams.append('variant', getVariantName(variant));
  }

  const searchParamsStr = searchParams.toString();
  if (!searchParamsStr) {
    return `${url}/${kind}`;
  }
  return `${url}/${kind}?${searchParams.toString()}`;
};

export default getURL;
