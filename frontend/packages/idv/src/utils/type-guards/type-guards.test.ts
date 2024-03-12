import {
  hasAuthMethodUnverifiedEmail,
  hasEmailAndPhoneNumber,
  isEmailOrPhoneIdentifier,
} from './type-guards';

describe('isEmailOrPhoneIdentifier', () => {
  type Args = Parameters<typeof isEmailOrPhoneIdentifier>;
  type Ctx = Args[0];

  it.each([
    { o: { email: undefined }, x: false },
    { o: { email: '' }, x: false },
    { o: { email: 'string' }, x: true },
    { o: { phoneNumber: undefined }, x: false },
    { o: { phoneNumber: '' }, x: false },
    { o: { phoneNumber: 'string' }, x: true },
  ])('case %#', ({ o, x }) => {
    expect(isEmailOrPhoneIdentifier(o as Ctx)).toEqual(x);
  });
});

describe('hasEmailAndPhoneNumber', () => {
  type Args = Parameters<typeof hasEmailAndPhoneNumber>;
  type Ctx = Args[0];

  it.each([
    { o: { email: undefined }, x: false },
    { o: { email: '' }, x: false },
    { o: { email: 'string' }, x: false },
    { o: { phoneNumber: undefined }, x: false },
    { o: { phoneNumber: '' }, x: false },
    { o: { phoneNumber: 'string' }, x: false },
    { o: { email: 'string', phoneNumber: 'string' }, x: true },
  ])('case %#', ({ o, x }) => {
    expect(hasEmailAndPhoneNumber(o as Ctx)).toEqual(x);
  });
});

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
