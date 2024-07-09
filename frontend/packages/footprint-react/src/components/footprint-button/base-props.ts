import type {
  FootprintAuthProps,
  FootprintUpdateLoginMethodsProps,
  FootprintVerifyProps,
} from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';

import type { AuthConditional, BaseSupportedProps, UserDataEmailAndPhone, VerifyConditional } from './types';
import { getVariant } from './utils';

export const getUserEmailAndPhone = (
  p: Omit<FootprintAuthProps, AuthConditional> | FootprintUpdateLoginMethodsProps,
): UserDataEmailAndPhone | undefined =>
  p.bootstrapData
    ? {
        'id.email': p.bootstrapData['id.email'],
        'id.phone_number': p.bootstrapData['id.phone_number'],
      }
    : undefined;

export const getBaseVerifyProps = (
  base: BaseSupportedProps,
  p: Omit<FootprintVerifyProps, VerifyConditional>,
): Omit<FootprintVerifyProps, VerifyConditional> => ({
  ...base,
  kind: FootprintComponentKind.Verify,
  onAuth: p.onAuth,
  options: p.options,
  bootstrapData: p.bootstrapData,
  variant: getVariant(p),
});

export const getBaseAuthProps = (
  base: BaseSupportedProps,
  p: Omit<FootprintAuthProps, AuthConditional>,
): Omit<FootprintAuthProps, AuthConditional> => ({
  ...base,
  kind: FootprintComponentKind.Auth,
  options: p.options ? { showLogo: p.options.showLogo } : undefined,
  bootstrapData: getUserEmailAndPhone(p),
  variant: getVariant(p),
});

export const getBaseUpdateLoginMethodsProps = (
  base: BaseSupportedProps,
  p: FootprintUpdateLoginMethodsProps,
): FootprintUpdateLoginMethodsProps => ({
  ...base,
  kind: FootprintComponentKind.UpdateLoginMethods,
  options: p.options ? { showLogo: p.options.showLogo } : undefined,
  bootstrapData: getUserEmailAndPhone(p),
  variant: getVariant(p),
});
