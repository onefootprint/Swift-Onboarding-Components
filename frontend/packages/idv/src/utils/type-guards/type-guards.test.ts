import {
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
