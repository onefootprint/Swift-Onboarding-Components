import {
  hasEmailMethodUnVerified,
  shouldShowChallengeSelector,
} from './predicates';

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

describe('hasEmailMethodUnVerified', () => {
  type Args = Parameters<typeof hasEmailMethodUnVerified>;
  type User = Args[0];

  it.each([
    { user: {}, x: false },
    { user: { authMethods: undefined }, x: false },
    { user: { authMethods: [] }, x: false },
    { user: { authMethods: [{ kind: 'email', isVerified: true }] }, x: false },
    { user: { authMethods: [{ kind: 'email', isVerified: false }] }, x: true },
  ])('case %#', ({ user, x }) => {
    expect(hasEmailMethodUnVerified(user as unknown as User)).toEqual(x);
  });
});
