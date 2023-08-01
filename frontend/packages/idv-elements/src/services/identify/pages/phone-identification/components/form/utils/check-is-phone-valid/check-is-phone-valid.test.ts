import checkIsPhoneValid from './check-is-phone-valid';

describe('checkIsPhoneValid', () => {
  it('validating sandbox phone number', () => {
    expect(checkIsPhoneValid('+1 555-555-0100', true)).toBe(true);
    expect(checkIsPhoneValid('+15555550100', true)).toBe(true);
    expect(checkIsPhoneValid('+1 555-555-0100', false)).toBe(false);
  });

  it('validating normal phone number', () => {
    expect(checkIsPhoneValid('+1 650-460-0700', false)).toBe(true);
    expect(checkIsPhoneValid('+16504600700', false)).toBe(true);
    expect(checkIsPhoneValid('+1 650-460-0700', true)).toBe(true);
  });
});
