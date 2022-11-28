import validateBootstrapData from './validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('filters out entries with invalid values', () => {
    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com',
      phoneNumber: '+16204623730',
    });

    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '++121313+',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com',
    });

    expect(
      validateBootstrapData({
        email: 'belce@!@@#!.com',
        phoneNumber: '+1231231231231231231231',
      }),
    ).toEqual({});

    expect(
      validateBootstrapData({
        email: 'invalid-email',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({ phoneNumber: '+16204623730' });

    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({ email: 'belce@onefootprint.com' });

    expect(
      validateBootstrapData({
        email: 'invalid-email',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({});
  });
});
