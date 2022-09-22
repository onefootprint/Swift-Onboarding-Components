import getInitialCountry from './get-initial-country';

describe('getInitialCountry', () => {
  it('should return the default country if no country is passed in', () => {
    expect(getInitialCountry()).toEqual({
      value: 'US',
      label: 'United States',
      value3: 'USA',
    });
  });

  it('should return the country if it is passed in', () => {
    expect(getInitialCountry('BR')).toEqual({
      value: 'BR',
      label: 'Brazil',
      value3: 'BRA',
    });
  });
});
