import getInitialCountry from './get-initial-country';

describe('getInitialCountry', () => {
  it('should return the default country if no country is passed in', () => {
    expect(getInitialCountry()).toEqual({
      label: 'United States of America',
      value: 'US',
    });
  });

  it('should return the country if it is passed in', () => {
    expect(getInitialCountry('BR')).toEqual({
      value: 'BR',
      label: 'Brazil',
    });
  });

  it('should return undefined if no country if it is passed in and ignoreDefaultCountry is true', () => {
    expect(getInitialCountry(undefined, true)).toBeUndefined();
  });
});
