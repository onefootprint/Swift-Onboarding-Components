import { hasAuthMethodUnverifiedEmail } from './type-guards';

describe('hasEmailMethodUnVerified', () => {
  type Args = Parameters<typeof hasAuthMethodUnverifiedEmail>;
  type User = Args[0];

  it.each([
    { user: {}, x: false },
    { user: { authMethods: undefined }, x: false },
    { user: { authMethods: [] }, x: false },
    { user: { authMethods: [{ kind: 'email', isVerified: true }] }, x: false },
    { user: { authMethods: [{ kind: 'email', isVerified: false }] }, x: true },
  ])('case %#', ({ user, x }) => {
    expect(hasAuthMethodUnverifiedEmail(user as unknown as User)).toEqual(x);
  });
});
