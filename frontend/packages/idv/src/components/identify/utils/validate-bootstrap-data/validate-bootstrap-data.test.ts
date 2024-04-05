import validateBootstrapData from './validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('filters out entries with invalid values', () => {
    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({
      email: {
        value: 'belce@onefootprint.com',
        isBootstrap: true,
      },
      phoneNumber: {
        value: '+16204623730',
        isBootstrap: true,
      },
    });

    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: '++121313+',
      }),
    ).toEqual({
      email: {
        value: 'belce@onefootprint.com',
        isBootstrap: true,
      },
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
    ).toEqual({
      phoneNumber: {
        value: '+16204623730',
        isBootstrap: true,
      },
    });

    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({
      email: {
        value: 'belce@onefootprint.com',
        isBootstrap: true,
      },
    });

    expect(
      validateBootstrapData({
        email: 'invalid-email',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({});
  });

  it('accepts sandbox emails/phones', () => {
    expect(
      validateBootstrapData({
        phoneNumber: '+16204623730#erwerwer',
      }),
    ).toEqual({});

    expect(
      validateBootstrapData({
        email: 'belce@onefootprint.com#ooooo',
      }),
    ).toEqual({});
  });
});
