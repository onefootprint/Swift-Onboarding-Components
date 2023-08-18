import getInitialCountry from './get-initial-country';

describe('getInitialCountry', () => {
  it('should return the default country if no country is passed in', () => {
    expect(getInitialCountry()).toEqual({
      label: 'United States of America',
      value: 'US',
      value3: 'USA',
      passport: true,
      idCard: true,
      driversLicense: true,
    });
  });

  it('should return the country if it is passed in', () => {
    expect(getInitialCountry('BR')).toEqual({
      value: 'BR',
      label: 'Brazil',
      value3: 'BRA',
      passport: true,
      idCard: false,
      driversLicense: false,
    });
  });
});
