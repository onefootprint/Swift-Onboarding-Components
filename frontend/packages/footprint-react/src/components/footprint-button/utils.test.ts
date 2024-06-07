import { describe, expect, it } from 'bun:test';

import type { FootprintButtonProps } from './types';
import { getClassName, getLabel, getVariant, isAuth, isUpdateLoginMethods, isVerify } from './utils';

it('isAuth', () => {
  expect(isAuth({ kind: 'auth' })).toBe(true);
  expect(isAuth({ kind: 'no-auth' })).toBe(false);
});

it('isVerify', () => {
  expect(isVerify({ kind: 'verify' })).toBe(true);
  expect(isVerify({ kind: 'no-verify' })).toBe(false);
});

it('isUpdateLoginMethods', () => {
  expect(isUpdateLoginMethods({ kind: 'update_login_methods' })).toBe(true);
  expect(isUpdateLoginMethods({ kind: 'no-update_login_methods' })).toBe(false);
});

describe('getClassName', () => {
  it.each([
    { obj: { kind: 'auth', className: '' }, x: 'footprint-auth-button' },
    { obj: { kind: 'auth', className: 'some-class' }, x: '' },
    { obj: { kind: 'verify', className: '' }, x: 'footprint-verify-button' },
    { obj: { kind: 'verify', className: 'some-class' }, x: '' },
    {
      obj: { kind: 'update_login_methods', className: '' },
      x: 'footprint-auth-button',
    },
    { obj: { kind: 'update_login_methods', className: 'some-class' }, x: '' },
  ])('case %#', ({ obj, x }) => {
    expect(getClassName(obj)).toEqual(x);
  });
});

describe('getLabel', () => {
  it.each([
    { obj: { kind: 'auth' }, x: 'Authenticate with Footprint' },
    {
      obj: { kind: 'auth', l10n: { language: 'es' } },
      x: 'Autenticar con Footprint',
    },
    { obj: { kind: 'verify' }, x: 'Verify with Footprint' },
    {
      obj: { kind: 'verify', l10n: { language: 'es' } },
      x: 'Verificar con Footprint',
    },
  ])('case %#', ({ obj, x }) => {
    expect(getLabel(obj)).toEqual(x);
  });
});

describe('getVariant', () => {
  it.each([
    { obj: { kind: 'auth', dialogVariant: 'modal' }, x: 'modal' },
    { obj: { kind: 'auth', dialogVariant: 'modal' }, x: 'modal' },
    { obj: { kind: 'auth', variant: 'modal' }, x: 'modal' },
    { obj: { kind: 'auth', variant: 'modal' }, x: 'modal' },
    { obj: { kind: 'auth', dialogVariant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'auth', dialogVariant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'auth', variant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'auth', variant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'auth', dialogVariant: 'WWW' }, x: 'modal' },
    { obj: { kind: 'verify', dialogVariant: 'modal' }, x: 'modal' },
    { obj: { kind: 'verify', dialogVariant: 'modal' }, x: 'modal' },
    { obj: { kind: 'verify', variant: 'modal' }, x: 'modal' },
    { obj: { kind: 'verify', variant: 'modal' }, x: 'modal' },
    { obj: { kind: 'verify', dialogVariant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'verify', dialogVariant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'verify', variant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'verify', variant: 'drawer' }, x: 'drawer' },
    { obj: { kind: 'verify', variant: 'WWW' }, x: 'modal' },
  ])('case %#', ({ obj, x }) => {
    expect(getVariant(obj as FootprintButtonProps)).toEqual(x as 'modal' | 'drawer');
  });
});
