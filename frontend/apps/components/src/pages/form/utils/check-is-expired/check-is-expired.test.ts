import checkIsExpired from './check-is-expired';

describe('checkIsExpired', () => {
  it('should return false if expiresAt is undefined', () => {
    expect(checkIsExpired()).toBe(false);
  });

  it('should return true if expiresAt is in the past', () => {
    expect(checkIsExpired(new Date('01/01/1996'))).toBe(true);
  });

  it('should return false if expiresAt is in the future', () => {
    expect(checkIsExpired(new Date('01/01/3000'))).toBe(false);
  });
});
