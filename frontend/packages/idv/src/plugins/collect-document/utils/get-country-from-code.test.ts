import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import { getDefaultCountry } from './get-country-from-code';

describe('getDefaultCountry', () => {
  it('should return country record for given country code', () => {
    const countryCode: CountryCode = 'MX';
    const supportedCountries = new Set([countryCode, 'US'] as CountryCode[]);
    const result = getDefaultCountry(supportedCountries, countryCode);
    expect(result.value).toEqual(countryCode);
  });

  it('should return US when available and country code is not provided', () => {
    const supportedCountries = new Set(['US', 'CA'] as CountryCode[]);
    const result = getDefaultCountry(supportedCountries);
    expect(result.value).toEqual('US');
  });

  it('should return DEFAULT_COUNTRY when country code is not in supported countries', () => {
    const countryCode: CountryCode = 'MX';
    const supportedCountries = new Set(['US', 'CA'] as CountryCode[]);
    const result = getDefaultCountry(supportedCountries, countryCode);
    expect(result).toEqual(DEFAULT_COUNTRY);
  });

  it('should return first country in set when US is not available and country code is not provided', () => {
    const supportedCountries = new Set(['CA', 'FR'] as CountryCode[]);
    const result = getDefaultCountry(supportedCountries);
    expect(result.value).toEqual('CA');
  });

  it('should return DEFAULT_COUNTRY when set of supported countries is empty', () => {
    const supportedCountries = new Set<CountryCode>();
    const result = getDefaultCountry(supportedCountries);
    expect(result).toEqual(DEFAULT_COUNTRY);
  });

  it('should throw error when supported countries set is null or undefined', () => {
    // @ts-expect-error: intentional invalid argument
    expect(() => getDefaultCountry(null, 'US')).toThrowError();
    // @ts-expect-error: intentional invalid argument
    expect(() => getDefaultCountry(undefined, 'US')).toThrowError();
  });
});
