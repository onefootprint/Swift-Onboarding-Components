import type {
  FootprintAuthProps,
  FootprintUpdateLoginMethodsProps,
  FootprintVerifyProps,
  L10n,
} from '@onefootprint/footprint-js';
import { FootprintComponentKind } from '@onefootprint/footprint-js';

import type { FootprintButtonProps } from './types';

type Obj = Record<string, unknown>;

const isSpanish = <T extends { l10n?: L10n }>(p: T): boolean => p?.l10n?.language === 'es';

export const isError = (x: unknown): x is Error => x instanceof Error;

export const isAuth = (p: Obj): p is FootprintAuthProps => p.kind === FootprintComponentKind.Auth;

export const isVerify = (p: Obj): p is FootprintVerifyProps => p.kind === FootprintComponentKind.Verify;

export const isUpdateLoginMethods = (p: Obj): p is FootprintUpdateLoginMethodsProps =>
  p.kind === FootprintComponentKind.UpdateLoginMethods;

export const getClassName = (p: Obj) => {
  if (!p.className && isAuth(p)) return 'footprint-auth-button';
  if (!p.className && isUpdateLoginMethods(p)) return 'footprint-auth-button';
  if (!p.className && isVerify(p)) return 'footprint-verify-button';
  return '';
};

export const getLabel = (p: Obj) => {
  if (!p.label && isAuth(p)) return isSpanish(p) ? 'Autenticar con Footprint' : 'Authenticate with Footprint';

  if (!p.label && isVerify(p)) return isSpanish(p) ? 'Verificar con Footprint' : 'Verify with Footprint';

  return '';
};

export const getVariant = (p: Pick<FootprintButtonProps, 'kind' | 'variant' | 'dialogVariant'>): 'modal' | 'drawer' => {
  const variant = p.dialogVariant || p.variant;
  const isValid = variant && ['modal', 'drawer'].some(v => v === variant);

  if (isValid && isAuth(p)) return variant;
  if (isValid && isVerify(p)) return variant;
  return 'modal';
};
