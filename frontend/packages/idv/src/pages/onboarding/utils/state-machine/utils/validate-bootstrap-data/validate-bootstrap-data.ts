import type { SupportedLocale } from '@onefootprint/footprint-js';
import { STATES } from '@onefootprint/global-constants';
import type { CountryCode, PublicOnboardingConfig } from '@onefootprint/types';
import {
  IdDI,
  isCountryCode,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';
import { isFuture } from 'date-fns';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { validate as isEmail } from 'isemail';

import type { UserData, UserDatum } from '../../../../../../types';
import { isObject, isStringValid } from '../../../../../../utils';
import Logger from '../../../../../../utils/logger';
import {
  fromUSDateToISO8601Format,
  strInputToUSDate,
} from '../../../../../../utils/string';

const getIsoDateString = (dateStr: string, locale: SupportedLocale) => {
  if (!isStringValid(dateStr)) {
    return undefined;
  }
  let isoDate;
  try {
    isoDate = fromUSDateToISO8601Format(strInputToUSDate(locale, dateStr));
  } catch (_) {
    return undefined;
  }
  return isoDate;
};

type UnvalidatedUserData = Partial<{
  [K in IdDI]: UserDatum<unknown>;
}>;

const validateUserData = (
  userData: UnvalidatedUserData,
  config: PublicOnboardingConfig,
  locale: SupportedLocale = 'en-US',
): UserData => {
  if (!isObject(userData)) {
    return {};
  }

  const isEmailValid = (email: string) =>
    isStringValid(email) && isEmail(email);

  const isPhoneValid = (phoneNumber: string) => {
    if (!isStringValid(phoneNumber)) {
      return false;
    }
    const phoneUtils = PhoneNumberUtil.getInstance();
    const sandboxNumber = '+1 555-555-0100';
    const matchesSandboxNumber =
      phoneUtils.isNumberMatch(phoneNumber, sandboxNumber) ===
      PhoneNumberUtil.MatchType.EXACT_MATCH;
    if (matchesSandboxNumber) {
      return true;
    }

    try {
      const parsedPhoneNumber = phoneUtils.parseAndKeepRawInput(phoneNumber);
      const region = phoneUtils.getRegionCodeForNumber(parsedPhoneNumber);
      return phoneUtils.isValidNumberForRegion(parsedPhoneNumber, region);
    } catch (_) {
      return false;
    }
  };

  const isNameValid = (name: string, allowEmpty?: boolean) => {
    const trimmedName = name?.trim();
    if (!trimmedName?.length && !allowEmpty) {
      return false;
    }
    const allowedChars = /^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$/;
    return allowedChars.test(trimmedName);
  };

  const isDobValid = (dob: string) => {
    const isoDateString = getIsoDateString(dob, locale);
    if (!isoDateString) {
      return false;
    }
    const dobDate = new Date(isoDateString);
    if (dobDate.getFullYear() < 1900 || isFuture(dobDate)) {
      return false;
    }
    const daysOnEarth =
      (new Date().getTime() - dobDate.getTime()) / (1000 * 3600 * 24);
    const minValidAge = 18;
    return daysOnEarth / 365 >= minValidAge;
  };

  const isSsn9Valid = (ssn9: string) => {
    const ssn9Regex =
      /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/;
    return isStringValid(ssn9) && ssn9Regex.test(ssn9);
  };

  const isSsn4Valid = (ssn4: string) => {
    const ssn4Regex = /^((?!(0000))\d{4})$/;
    return isStringValid(ssn4) && ssn4Regex.test(ssn4);
  };

  const isAddressLine1Valid = (addressLine1: string) => {
    const addressLine1Regex = /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i;
    return isStringValid(addressLine1) && addressLine1Regex.test(addressLine1);
  };

  const isStateValid = (state: string, country?: string): boolean => {
    if (country === 'US') {
      return STATES.some(elem => elem.value === state);
    }
    return isStringValid(state);
  };

  const isCitizenshipsValid = (citizenships: string) =>
    Array.isArray(citizenships) && citizenships.every(c => isCountryCode(c));

  const isVisaKindValid = (visaKind: string) =>
    isStringValid(visaKind) &&
    Object.values(VisaKind).includes(visaKind as VisaKind);

  const isUsLegalStatusValid = (status: string) =>
    isStringValid(status) &&
    Object.values(UsLegalStatus).includes(status as UsLegalStatus);

  const isVisaExpirationDateValid = (dateStr: string) => {
    const isoDateString = getIsoDateString(dateStr, locale);
    if (!isoDateString) {
      return false;
    }
    const date = new Date(isoDateString);
    return date.getFullYear() > 1900 && date.getFullYear() < 3000;
  };

  const isCountryValid = (country: string) => {
    if (!isCountryCode(country)) return false;
    if (config.supportedCountries?.length) {
      return config.supportedCountries.includes(country as CountryCode);
    }
    return true;
  };

  const ValidatorByField: Record<IdDI, (...args: string[]) => boolean> = {
    [IdDI.email]: isEmailValid,
    [IdDI.phoneNumber]: isPhoneValid,
    [IdDI.firstName]: (value: string) => isNameValid(value),
    [IdDI.middleName]: (value: string) => isNameValid(value, true),
    [IdDI.lastName]: (value: string) => isNameValid(value),
    [IdDI.dob]: isDobValid,
    [IdDI.ssn9]: isSsn9Valid,
    [IdDI.ssn4]: isSsn4Valid,
    [IdDI.addressLine1]: isAddressLine1Valid,
    [IdDI.addressLine2]: isStringValid,
    [IdDI.city]: isStringValid,
    [IdDI.state]: (state: string, country?: string) =>
      isStateValid(state, country),
    [IdDI.country]: isCountryValid,
    [IdDI.zip]: isStringValid,
    [IdDI.usLegalStatus]: isUsLegalStatusValid,
    [IdDI.citizenships]: isCitizenshipsValid,
    [IdDI.nationality]: isCountryCode,
    [IdDI.visaKind]: isVisaKindValid,
    [IdDI.visaExpirationDate]: isVisaExpirationDateValid,
  };

  // Ignore null or undefined values or invalid keys
  const filledEntries = Object.entries(userData).filter(
    ([key, value]) => key in ValidatorByField && !!value?.value,
  );
  const filledData = Object.fromEntries(filledEntries);

  // If the values are provided, they should pass the validators
  const validatedEntries = filledEntries.filter(([key, value]) => {
    if (key === IdDI.state) {
      const country = filledData[IdDI.country];
      return !!ValidatorByField[IdDI.state](
        value.value as string,
        country?.value as string,
      );
    }
    return !!ValidatorByField[key as IdDI](value.value as string);
  });

  const validatedData = Object.fromEntries(validatedEntries);
  const validatedKeys = new Set(Object.keys(validatedData));
  const allKeys = Object.keys(userData) as IdDI[];
  const invalidKeys = allKeys.filter(key => !validatedKeys.has(key));
  if (invalidKeys.length) {
    Logger.warn(
      `Filtering out invalid bootstrapped user data for keys: ${invalidKeys.join(
        ', ',
      )}`,
      { location: 'validate-bootstrap-data' },
    );
  }

  return Object.fromEntries(validatedEntries);
};

export default validateUserData;
