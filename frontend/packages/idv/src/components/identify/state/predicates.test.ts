import { ChallengeKind } from '@onefootprint/types';

import { requiresPhoneVerification, shouldShowChallengeSelector } from './predicates';
import type { IdentifyContext, IdentifyMachineContext } from './types';
import { IdentifyVariant } from './types';

describe('requiresPhoneVerification', () => {
  type Args = Parameters<typeof requiresPhoneVerification>;
  type Config = Args[0];
  type User = Args[1];
  type Method = Args[2];

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
    expect(requiresPhoneVerification(config as unknown as Config, user as unknown as User, method as Method)).toEqual(
      x,
    );
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
    expect(
      shouldShowChallengeSelector(context as IdentifyMachineContext, user as unknown as IdentifyContext['user']),
    ).toEqual(x);
  });
});
