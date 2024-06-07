import { describe, expect, it } from 'bun:test';

import { isAuthOrVerifyOrUpdateLogin, isAuthUpdateLoginMethods, isUpdateLoginMethods, isValidString } from '.';
import type { Props } from '../../types/components';

describe('isAuthOrVerifyOrUpdateLogin', () => {
  it.each([
    { kind: 'auth', x: true },
    { kind: 'form', x: false },
    { kind: 'render', x: false },
    { kind: 'update_login_methods', x: true },
    { kind: 'verify-button', x: false },
    { kind: 'verify', x: true },
    { kind: 'components', x: true },
  ])('case %#', ({ kind, x }) => {
    expect(isAuthOrVerifyOrUpdateLogin(kind)).toEqual(x);
  });
});

describe('isValidString', () => {
  it.each([
    { input: 'string', x: true },
    { input: '', x: false },
    { input: 1, x: false },
    { input: String('verify-button'), x: true },
    { input: String(''), x: false },
  ])('case %#', ({ input, x }) => {
    expect(isValidString(input)).toEqual(x);
  });
});

describe('isAuthUpdateLoginMethods / isUpdateLoginMethods', () => {
  const cases = [
    {
      obj: { kind: 'auth', updateLoginMethods: true, authToken: 'utok_' },
      x: true,
    },
    {
      obj: { kind: 'auth', updateLoginMethods: true, authToken: 'tok_' },
      x: true,
    },
    {
      obj: { kind: 'verify', updateLoginMethods: true, authToken: 'tok_' },
      x: false,
    },
    {
      obj: { kind: 'auth', updateLoginMethods: false, authToken: 'tok_' },
      x: false,
    },
    {
      obj: { kind: 'auth', updateLoginMethods: true, authToken: '_kot' },
      x: false,
    },
    {
      obj: { kind: 'auth', updateLoginMethods: true, publicKey: 'publicKey' },
      x: false,
    },
  ];

  it.each(cases)('isAuthUpdateLoginMethods %#', ({ obj, x }) => {
    expect(isAuthUpdateLoginMethods(obj as Props)).toEqual(x);
  });

  it.each([
    ...cases,
    {
      obj: { kind: 'update_login_methods', publicKey: 'publicKey' },
      x: false,
    },
    {
      obj: { kind: 'update_login_methods', authToken: '_kot' },
      x: false,
    },
    {
      obj: { kind: 'update_login_methods', authToken: 'utok_' },
      x: true,
    },
  ])('isUpdateLoginMethods %#', ({ obj, x }) => {
    expect(isUpdateLoginMethods(obj as Props)).toEqual(x);
  });
});
