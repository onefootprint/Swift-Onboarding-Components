import {
  requiresPhoneVerification,
  shouldShowChallengeSelector,
} from './predicates';

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
    expect(
      requiresPhoneVerification(
        config as unknown as Config,
        user as unknown as User,
        method as Method,
      ),
    ).toEqual(x);
  });
});

describe('shouldShowChallengeSelector', () => {
  type Args = Parameters<typeof shouldShowChallengeSelector>;
  type Ctx = Args[0];
  type User = Args[1];

  it.each([
    { c: {}, user: { availableChallengeKinds: [] }, x: false },
    { c: {}, user: { availableChallengeKinds: ['one'] }, x: false },
    { c: {}, user: { availableChallengeKinds: ['one', 'two'] }, x: true },
    { c: {}, user: { availableChallengeKinds: ['biometric'] }, x: true },
    { c: { variant: 'updateLoginMethods' }, user: {}, x: true },
  ])('case %#', ({ c, user, x }) => {
    expect(
      shouldShowChallengeSelector(c as Ctx, user as unknown as User),
    ).toEqual(x);
  });
});
