import { describe, expect, it } from 'bun:test';

import type { Props } from '../../types/components';
import { isAuthOrVerify, isAuthUpdateLoginMethods, isValidString } from '.';

describe('isAuthOrVerify', () => {
  it.each([
    { kind: 'auth', x: true },
    { kind: 'form', x: false },
    { kind: 'render', x: false },
    { kind: 'verify-button', x: false },
    { kind: 'verify', x: true },
  ])('case %#', ({ kind, x }) => {
    expect(isAuthOrVerify(kind)).toEqual(x);
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

describe('isAuthUpdateLoginMethods', () => {
  it.each([
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
  ])('case %#', ({ obj, x }) => {
    expect(isAuthUpdateLoginMethods(obj as Props)).toEqual(x);
  });
});
