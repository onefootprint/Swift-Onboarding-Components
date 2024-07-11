import { isAddressLine, isEmail, isName, isSSN9Flexible, isSsn4 } from '@onefootprint/core';
import type { SupportedLocale } from '@onefootprint/footprint-js';
import { STATES } from '@onefootprint/global-constants';
import type { CountryCode, PublicOnboardingConfig } from '@onefootprint/types';
import { BusinessDI, IdDI, UsLegalStatus, VisaKind, isCountryCode } from '@onefootprint/types';
import { isFuture } from 'date-fns';
import { PhoneNumberUtil } from 'google-libphonenumber';

import type { DIMetadata, UserData } from '../../../../../../types';
import { isObject, isStringValid } from '../../../../../../utils';
import { getLogger } from '../../../../../../utils/logger';
import { fromUSDateToISO8601Format, strInputToUSDate } from '../../../../../../utils/string';

type UnvalidatedUserData = Partial<{ [K in IdDI]: DIMetadata<unknown> }>;
type Predicate = (...args: string[]) => boolean;

const { logWarn } = getLogger({ location: 'validate-bootstrap-data' });

const isNameValid = (str: string, allowEmpty?: boolean): boolean => {
  return !allowEmpty && !str?.trim()?.length ? false : isName(str);
};

const getIsoDateString = (dateStr: string, locale: SupportedLocale): string | undefined => {
  if (!isStringValid(dateStr)) return undefined;

  let isoDate;
  try {
    isoDate = fromUSDateToISO8601Format(strInputToUSDate(locale, dateStr));
  } catch (_) {
    return undefined;
  }
  return isoDate;
};

const isPhoneValid = (str: string): boolean => {
  if (!isStringValid(str)) return false;

  const phoneUtils = PhoneNumberUtil.getInstance();
  const sandboxNumber = '+1 555-555-0100';
  const matchesSandboxNumber = phoneUtils.isNumberMatch(str, sandboxNumber) === PhoneNumberUtil.MatchType.EXACT_MATCH;
  if (matchesSandboxNumber) {
    return true;
  }

  try {
    const parsedPhoneNumber = phoneUtils.parseAndKeepRawInput(str);
    const region = phoneUtils.getRegionCodeForNumber(parsedPhoneNumber);
    return phoneUtils.isValidNumberForRegion(parsedPhoneNumber, region);
  } catch (_) {
    return false;
  }
};

const isStateValid = (state: string, country?: string): boolean =>
  country === 'US' ? STATES.some(s => s.value === state) : isStringValid(state);

const isDobValid = (locale: SupportedLocale, dob: string): boolean => {
  const isoDateString = getIsoDateString(dob, locale);
  if (!isoDateString) return false;

  const dobDate = new Date(isoDateString);
  if (dobDate.getFullYear() < 1900 || isFuture(dobDate)) {
    return false;
  }
  const daysOnEarth = (new Date().getTime() - dobDate.getTime()) / (1000 * 3600 * 24);
  const minValidAge = 18;
  return daysOnEarth / 365 >= minValidAge;
};

const isVisaExpirationDateValid = (locale: SupportedLocale, dateStr: string): boolean => {
  const isoDateString = getIsoDateString(dateStr, locale);
  if (!isoDateString) return false;

  const date = new Date(isoDateString);
  return date.getFullYear() > 1900 && date.getFullYear() < 3000;
};

const isCitizenshipsValid = (strOrArray: string): boolean =>
  Array.isArray(strOrArray) && strOrArray.every(c => isCountryCode(c));

const isVisaKindValid = (str: string): boolean =>
  isStringValid(str) && Object.values(VisaKind).includes(str as VisaKind);

const isUsLegalStatusValid = (str: string): boolean =>
  isStringValid(str) && Object.values(UsLegalStatus).includes(str as UsLegalStatus);

const isCountryValid = (config: PublicOnboardingConfig, country: string): boolean => {
  if (!isCountryCode(country)) return false;
  if (config.supportedCountries?.length) {
    return config.supportedCountries.includes(country as CountryCode);
  }
  return true;
};

const validateBootstrapData = (
  bootstrapData: UnvalidatedUserData,
  config: PublicOnboardingConfig,
  locale: SupportedLocale = 'en-US',
): UserData => {
  if (!isObject(bootstrapData)) return {};

  const FieldsValidator: Record<IdDI | BusinessDI, Predicate> = {
    [IdDI.addressLine1]: isAddressLine,
    [IdDI.addressLine2]: isStringValid,
    [IdDI.citizenships]: isCitizenshipsValid,
    [IdDI.city]: isStringValid,
    [IdDI.country]: (s: string) => isCountryValid(config, s),
    [IdDI.dob]: (s: string) => isDobValid(locale, s),
    [IdDI.email]: (s: string) => isEmail(s),
    [IdDI.firstName]: (s: string) => isNameValid(s),
    [IdDI.itin]: () => true,
    [IdDI.lastName]: (s: string) => isNameValid(s),
    [IdDI.middleName]: (s: string) => isNameValid(s, true),
    [IdDI.nationality]: isCountryCode,
    [IdDI.phoneNumber]: isPhoneValid,
    [IdDI.ssn4]: isSsn4,
    [IdDI.ssn9]: isSSN9Flexible,
    [IdDI.state]: (state: string, country?: string) => isStateValid(state, country),
    [IdDI.usLegalStatus]: isUsLegalStatusValid,
    [IdDI.usTaxId]: () => true,
    [IdDI.visaExpirationDate]: (s: string) => isVisaExpirationDateValid(locale, s),
    [IdDI.visaKind]: isVisaKindValid,
    [IdDI.zip]: isStringValid,
    [BusinessDI.addressLine1]: isAddressLine,
    [BusinessDI.addressLine2]: isStringValid,
    [BusinessDI.beneficialOwners]: () => true, // TODO: Add real validators for this field
    [BusinessDI.city]: isStringValid,
    [BusinessDI.corporationType]: () => true, // TODO: Add real validators for this field
    [BusinessDI.country]: (s: string) => isCountryValid(config, s),
    [BusinessDI.doingBusinessAs]: () => true, // TODO: Add real validators for this field
    [BusinessDI.formationDate]: () => true, // TODO: Add real validators for this field
    [BusinessDI.formationState]: () => true, // TODO: Add real validators for this field
    [BusinessDI.kycedBeneficialOwners]: () => true, // TODO: Add real validators for this field
    [BusinessDI.name]: isStringValid,
    [BusinessDI.phoneNumber]: isPhoneValid,
    [BusinessDI.state]: (state: string, country?: string) => isStateValid(state, country),
    [BusinessDI.tin]: () => true, // TODO: Add real validators for this field
    [BusinessDI.website]: isStringValid,
    [BusinessDI.zip]: isStringValid,
  };

  // Ignore null or undefined values or invalid keys
  const filledEntries = Object.entries(bootstrapData).filter(([k, v]) => k in FieldsValidator && !!v?.value);
  const filledData = Object.fromEntries(filledEntries);

  // If the values are provided, they should pass the validators
  const validatedEntries = filledEntries.filter(([k, v]) => {
    if (k === IdDI.state || k === BusinessDI.state) {
      const country = filledData[IdDI.country];
      return !!FieldsValidator[IdDI.state](v.value as string, country?.value as string);
    }
    return !!FieldsValidator[k as IdDI](v.value as string);
  });

  const validatedData = Object.fromEntries(validatedEntries);
  const validatedKeys = new Set(Object.keys(validatedData));
  const allKeys = Object.keys(bootstrapData) as IdDI[];
  const invalidKeys = allKeys.filter(key => !validatedKeys.has(key));

  if (invalidKeys.length) {
    logWarn(`Filtering out invalid bootstrapped user data for keys: ${invalidKeys.join(', ')}`);
  }

  return Object.fromEntries(validatedEntries);
};

export default validateBootstrapData;
