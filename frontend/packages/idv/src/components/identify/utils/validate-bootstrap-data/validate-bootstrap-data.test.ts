import validateBootstrapData from './validate-bootstrap-data';

describe('validateBootstrapData', () => {
  it('should filter out invalid inputs', () => {
    expect(
      validateBootstrapData({
        email: 'jane@onefootprint.com',
        phoneNumber: '+16204623730',
      }),
    ).toEqual({
      email: {
        value: 'jane@onefootprint.com',
        isBootstrap: true,
      },
      phoneNumber: {
        value: '+16204623730',
        isBootstrap: true,
      },
    });

    expect(
      validateBootstrapData({
        email: 'jane@onefootprint.com',
        phoneNumber: '++121313+',
      }),
    ).toEqual({
      email: {
        value: 'jane@onefootprint.com',
        isBootstrap: true,
      },
    });

    expect(
      validateBootstrapData({
        email: 'jane@!@@#!.com',
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
        email: 'jane@onefootprint.com',
        phoneNumber: 'invalid-email',
      }),
    ).toEqual({
      email: {
        value: 'jane@onefootprint.com',
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

  it('should accept valid inputs', () => {
    expect(
      validateBootstrapData({
        phoneNumber: '+16204623730#erwerwer',
      }),
    ).toEqual({});

    expect(
      validateBootstrapData({
        email: 'jane@onefootprint.com#ooooo',
      }),
    ).toEqual({});
  });
});
