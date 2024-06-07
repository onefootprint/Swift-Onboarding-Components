import { IdDI } from '@onefootprint/types';

import getMobilePropsFromUrl from './get-mobile-props-from-url';
import getUrl from './get-mobile-props-from-url.test.config';

describe('getMobilePropsFromUrl', () => {
  const userData = {
    [IdDI.email]: 'piip@onefootprint.com',
    [IdDI.phoneNumber]: '+15555550100',
    [IdDI.firstName]: 'Piip',
    [IdDI.middleName]: 'I',
    [IdDI.lastName]: 'Foot',
    [IdDI.dob]: '02/01/1992',
    [IdDI.ssn9]: '123451234',
    [IdDI.ssn4]: '1234',
    [IdDI.addressLine1]: '1234 Main St',
    [IdDI.addressLine2]: 'Apt 2',
    [IdDI.nationality]: 'US',
    [IdDI.city]: 'San Francisco',
    [IdDI.state]: 'CA',
    [IdDI.country]: 'US',
    [IdDI.zip]: '91212',
    [IdDI.usLegalStatus]: 'citizen',
    [IdDI.citizenships]: ['US'],
    [IdDI.visaKind]: 'f1',
    [IdDI.visaExpirationDate]: '01/01/2030',
  };
  const options = {
    showCompletionPage: true,
    showLogo: true,
  };
  const l10n = {
    locale: 'es-MX',
  };

  it('should return no data when a invalid URL is provided', () => {
    expect(getMobilePropsFromUrl('')).toEqual(undefined);

    expect(getMobilePropsFromUrl('a')).toEqual(undefined);

    expect(getMobilePropsFromUrl('/path#FragmentIdentifierHash')).toEqual(undefined);

    expect(getMobilePropsFromUrl('/path#ENCODED_LEGACY_USER_DATA__ENCODED_LEGACY_OPTIONS')).toEqual(undefined);

    expect(
      getMobilePropsFromUrl('/path#ENCODED_LEGACY_USER_DATA__ENCODED_LEGACY_OPTIONS__ENCODED_LEGACY_L10N'),
    ).toEqual(undefined);
  });

  it('should be able to decode userData', () => {
    expect(getMobilePropsFromUrl(getUrl({ userData }))).toEqual({
      userData,
      options: undefined,
      l10n: undefined,
      authToken: undefined,
    });
  });

  it('should be able to decode userData and options', () => {
    expect(getMobilePropsFromUrl(getUrl({ userData, options }))).toEqual({
      userData,
      options,
      l10n: undefined,
      authToken: undefined,
    });
  });

  it('should be able to decode userData, options, l10n', () => {
    expect(getMobilePropsFromUrl(getUrl({ userData, options, l10n }))).toEqual({
      userData,
      options,
      l10n,
      authToken: undefined,
    });
  });
});
