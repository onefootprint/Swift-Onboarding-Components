import { describe, expect, it } from 'bun:test';

import {
  getConditionalAuthProps,
  getConditionalUpdateLoginMethodsProps,
  getConditionalVerifyProps,
} from './conditional-props';

describe('getVerifyConditionalProps', () => {
  type Props = Parameters<typeof getConditionalVerifyProps>[0];

  it.each([
    { props: {}, x: expect.any(TypeError) },
    { props: { authToken: 'tok_' }, x: { authToken: 'tok_' } },
    { props: { publicKey: 'pk_' }, x: { publicKey: 'pk_' } },
    {
      props: { authToken: 'tok_', publicKey: 'pk_' },
      x: { authToken: 'tok_' },
    },
  ])('case %#', ({ props, x }) => {
    expect(getConditionalVerifyProps(props as Props)).toEqual(x);
  });
});

describe('getUpdateLoginMethodsConditionalProps', () => {
  type Props = Parameters<typeof getConditionalUpdateLoginMethodsProps>[0];

  it.each([
    { props: {}, x: expect.any(TypeError) },
    { props: { publicKey: 'pk_' }, x: expect.any(TypeError) },
    { props: { authToken: 'tok_' }, x: { authToken: 'tok_' } },
  ])('case %#', ({ props, x }) => {
    expect(getConditionalUpdateLoginMethodsProps(props as Props)).toEqual(x);
  });
});

describe('getAuthConditionalProps', () => {
  type Props = Parameters<typeof getConditionalAuthProps>[0];

  it.each([
    { props: {}, x: expect.any(TypeError) },
    { props: { authToken: 'tok_' }, x: expect.any(TypeError) },
    {
      props: { authToken: 'tok_', updateLoginMethods: false },
      x: expect.any(TypeError),
    },
    {
      props: { authToken: 'tok_', updateLoginMethods: true },
      x: { authToken: 'tok_', updateLoginMethods: true },
    },
    { props: { publicKey: 'pk_' }, x: { publicKey: 'pk_' } },
  ])('case %#', ({ props, x }) => {
    expect(getConditionalAuthProps(props as Props)).toEqual(x);
  });
});
