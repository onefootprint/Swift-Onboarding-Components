import { describe, expect, it } from 'bun:test';

import {
  getBaseAuthProps,
  getBaseUpdateLoginMethodsProps,
  getBaseVerifyProps,
  getUserEmailAndPhone,
} from './base-props';

describe('getBaseVerifyProps', () => {
  type Base = Parameters<typeof getBaseVerifyProps>[0];
  type Props = Parameters<typeof getBaseVerifyProps>[1];

  it('should force kind verify and forward bootstrapData and options', () => {
    const base: Base = {};
    const props: Props = {
      kind: 'kind' as Props['kind'],
      options: { showCompletionPage: true, showLogo: true },
      bootstrapData: { 'id.first_name': 'Name' },
      variant: 'modal',
    };
    const result = getBaseVerifyProps(base, props);

    expect(result).toEqual({
      kind: 'verify' as Props['kind'],
      options: { showCompletionPage: true, showLogo: true },
      bootstrapData: { 'id.first_name': 'Name' },
      variant: 'modal',
    });
  });
});

describe('getBaseAuthProps', () => {
  type Base = Parameters<typeof getBaseAuthProps>[0];
  type Props = Parameters<typeof getBaseAuthProps>[1];

  it('should force kind auth and modify bootstrapData and options', () => {
    const base: Base = {};
    const props = {
      kind: 'kind' as Props['kind'],
      options: { showCompletionPage: true, showLogo: true },
      bootstrapData: { 'id.first_name': 'Name' },
      variant: 'modal',
    } as Props;
    const result = getBaseAuthProps(base, props);

    expect(result).toEqual({
      kind: 'auth' as Props['kind'],
      options: { showLogo: true },
      bootstrapData: {},
      variant: 'modal',
    });
  });
});

describe('getBaseUpdateLoginMethodsProps', () => {
  type Base = Parameters<typeof getBaseUpdateLoginMethodsProps>[0];
  type Props = Parameters<typeof getBaseUpdateLoginMethodsProps>[1];

  it('should force update_login_methods auth and modify bootstrapData and options', () => {
    const base: Base = {};
    const props = {
      kind: 'kind' as Props['kind'],
      options: { showCompletionPage: true, showLogo: false },
      bootstrapData: { 'id.first_name': 'Name', 'id.email': 'a@b.com' },
      variant: 'modal',
    } as Props;
    const result = getBaseUpdateLoginMethodsProps(base, props);

    expect(result).toEqual({
      kind: 'update_login_methods' as Props['kind'],
      options: { showLogo: false },
      bootstrapData: { 'id.email': 'a@b.com' },
      variant: 'modal',
    });
  });
});

describe('getUserEmailAndPhone', () => {
  type Obj = Parameters<typeof getUserEmailAndPhone>[0];

  it.each([
    {
      obj: {
        bootstrapData: { 'id.email': 'a@b.com', 'id.phone_number': '+123' },
      },
      x: { 'id.email': 'a@b.com', 'id.phone_number': '+123' },
    },
    {
      obj: {
        bootstrapData: {
          'id.email': 'a@b.com',
          'id.phone_number': '+123',
          'id.first_name': 'Name',
        },
      },
      x: { 'id.email': 'a@b.com', 'id.phone_number': '+123' },
    },
    {
      obj: {
        bootstrapData: {
          'id.email': 'a@b.com',
          'id.phone_number': '+123',
          banana: 1,
        },
      },
      x: { 'id.email': 'a@b.com', 'id.phone_number': '+123' },
    },
  ])('case %#', ({ obj, x }) => {
    expect(getUserEmailAndPhone(obj as Obj)).toEqual(x);
  });
});
