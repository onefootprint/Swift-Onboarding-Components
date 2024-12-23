import { ChallengeKind } from '@onefootprint/types';

import { isPhone } from 'src/utils/type-guards';
import type { IdentifyContext, IdentifyMachineContext } from './types';
import { IdentifyVariant } from './types';
import { isRequiredAuthMethodsPending, shouldShowChallengeSelector } from './utils';

type User = IdentifyContext['user'];

describe('!phone + isRequiredAuthMethodsPending', () => {
  const required = { requiredAuthMethods: ['phone'] };
  const phoneIn = { authMethods: [{ kind: 'phone', isVerified: true }] };
  const phoneOut = { authMethods: [{ kind: 'phone', isVerified: false }] };

  it.each([
    { config: required, user: phoneIn, method: undefined, x: false },
    { config: required, user: phoneIn, method: 'phone', x: false },
    { config: required, user: phoneIn, method: 'email', x: false },
    { config: required, user: phoneIn, method: 'passkey', x: false },
    { config: required, user: phoneOut, method: undefined, x: true },
    { config: required, user: phoneOut, method: 'phone', x: false },
    { config: required, user: phoneOut, method: 'email', x: true },
    { config: required, user: phoneOut, method: 'passkey', x: true },
    {
      config: { requiredAuthMethods: undefined },
      user: phoneOut,
      method: undefined,
      x: false,
    },
  ])('case %#', ({ config, user, method, x }) => {
    const ctx = {
      config,
      identify: { user } as unknown as User,
    } as unknown as IdentifyMachineContext;
    expect(!isPhone(method) && isRequiredAuthMethodsPending('phone', ctx)).toEqual(x);
  });
});

describe('shouldShowChallengeSelector', () => {
  const contexts: {
    context: Partial<IdentifyMachineContext>;
    user: Partial<IdentifyContext['user']>;
    x: boolean;
  }[] = [
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: { availableChallengeKinds: [] },
      x: false,
    },
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: {
        availableChallengeKinds: [ChallengeKind.biometric, ChallengeKind.sms],
      },
      x: false,
    },
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: {
        availableChallengeKinds: [ChallengeKind.biometric, ChallengeKind.sms, ChallengeKind.email],
      },
      x: true,
    },
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: {
        availableChallengeKinds: [ChallengeKind.biometric, ChallengeKind.sms],
      },
      x: true,
    },
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: true,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: {
        availableChallengeKinds: [ChallengeKind.biometric, ChallengeKind.sms, ChallengeKind.email],
      },
      x: true,
    },
    {
      context: {
        device: {
          type: 'mobile',
          hasSupportForWebauthn: false,
          osName: 'android',
          browser: 'browser',
        },
      },
      user: { availableChallengeKinds: [ChallengeKind.biometric] },
      x: false,
    },
    {
      context: { variant: IdentifyVariant.updateLoginMethods },
      user: {},
      x: true,
    },
  ];

  it.each(contexts)('case %#', ({ context, user, x }) => {
    const ctx = { ...context, identify: { user } } as IdentifyMachineContext;
    expect(shouldShowChallengeSelector(ctx)).toEqual(x);
  });
});

describe('isRequiredAuthMethodsPending', () => {
  const ctx = {
    config: { requiredAuthMethods: ['email', 'phone'] },
    identify: {
      user: {
        authMethods: [
          { kind: 'email', isVerified: true },
          { kind: 'phone', isVerified: false },
        ],
      },
    },
  } as IdentifyMachineContext;

  it('should return true if the kind is required and the user has not verified it', () => {
    expect(isRequiredAuthMethodsPending('email', ctx)).toBe(false);
    expect(isRequiredAuthMethodsPending('phone', ctx)).toBe(true);
  });

  it('should return false if the kind is not required or the user has verified it', () => {
    // @ts-expect-error: this is intentional
    expect(isRequiredAuthMethodsPending('unknown', ctx)).toBe(false);

    expect(
      isRequiredAuthMethodsPending('email', {
        ...ctx,
        // @ts-expect-error: this is intentional
        config: { requiredAuthMethods: [] },
        // @ts-expect-error: this is intentional
        identify: { user: { authMethods: [] } },
      }),
    ).toBe(false);
    expect(
      isRequiredAuthMethodsPending('phone', {
        ...ctx, // @ts-expect-error: this is intentional
        identify: { user: { authMethods: [{ kind: 'phone', isVerified: true }] } },
      }),
    ).toBe(false);
  });
});
