import legacyValidateBootstrapData from './legacy-validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('filters out entries with invalid values', () => {
    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com',
      phoneNumber: '+16204623730',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '++121313+',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@!@@#!.com',
        phoneNumber: '+1231231231231231231231',
      }),
    ).toEqual({});

    expect(
      legacyValidateBootstrapData({
        email: 'invalid-email',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({ phoneNumber: '+16204623730' });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({ email: 'belce@onefootprint.com' });

    expect(
      legacyValidateBootstrapData({
        email: 'invalid-email',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({});
  });

  it('accepts sandbox emails/phones', () => {
    expect(
      legacyValidateBootstrapData({
        phoneNumber: '+16204623730#erwerwer',
      }),
    ).toEqual({
      phoneNumber: '+16204623730#erwerwer',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com#ooooo',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com#ooooo',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com#123',
        phoneNumber: '+16204623730#123',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com#123',
      phoneNumber: '+16204623730#123',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'invalid-email#234234',
        phoneNumber: '+16204623730#123',
      }),
    ).toEqual({
      phoneNumber: '+16204623730#123',
    });

    expect(
      legacyValidateBootstrapData({
        email: 'belce@onefootprint.com#123',
        phoneNumber: 'invalid-phone#1232131',
      }),
    ).toEqual({
      email: 'belce@onefootprint.com#123',
    });
  });
});
