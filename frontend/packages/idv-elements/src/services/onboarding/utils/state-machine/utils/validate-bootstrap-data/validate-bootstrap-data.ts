import type { SupportedLocale } from '@onefootprint/footprint-js';
import { STATES } from '@onefootprint/global-constants';
import {
  IdDI,
  type IdvBootstrapData,
  isCountryCode,
  UsLegalStatus,
  VisaKind,
} from '@onefootprint/types';
import { isFuture } from 'date-fns';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { validate as isEmail } from 'isemail';

import {
  fromUSDateToISO8601Format,
  strInputToUSDate,
} from '../../../../../../utils/string';

const isObject = (obj: any) => typeof obj === 'object' && !!obj;
const isValidString = (str: any) => str && typeof str === 'string';
const getIsoDateString = (dateStr: any, locale: SupportedLocale) => {
  if (!isValidString(dateStr)) {
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

const validateUserData = (
  userData: any,
  locale: SupportedLocale = 'en-US',
): IdvBootstrapData => {
  if (!isObject(userData)) {
    return {};
  }

  const isEmailValid = (email: any) => isValidString(email) && isEmail(email);

  const isPhoneValid = (phoneNumber: any) => {
    if (!isValidString(phoneNumber)) {
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

  const isNameValid = (name: any, allowEmpty?: boolean) => {
    const trimmedName = name?.trim();
    if (!trimmedName?.length && !allowEmpty) {
      return false;
    }
    const allowedChars = /^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$/;
    return allowedChars.test(trimmedName);
  };

  const isDobValid = (dob: any) => {
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

  const isSsn9Valid = (ssn9: any) => {
    const ssn9Regex =
      /^(?!(000|666|9))(\d{3}-?(?!(00))\d{2}-?(?!(0000))\d{4})$/;
    return isValidString(ssn9) && ssn9Regex.test(ssn9);
  };

  const isSsn4Valid = (ssn4: any) => {
    const ssn4Regex = /^((?!(0000))\d{4})$/;
    return isValidString(ssn4) && ssn4Regex.test(ssn4);
  };

  const isAddressLine1Valid = (addressLine1: any) => {
    const addressLine1Regex = /^(?!p\.?o\.?\s*?(?:box)?\s*?[0-9]+?).*$/i;
    return isValidString(addressLine1) && addressLine1Regex.test(addressLine1);
  };

  const isStateValid = (state: any, country?: any) => {
    if (country === 'US') {
      return STATES.find(elem => elem.value === state);
    }
    return isValidString(state);
  };

  const isCitizenshipsValid = (citizenships: any) =>
    Array.isArray(citizenships) && citizenships.every(c => isCountryCode(c));

  const isVisaKindValid = (visaKind: any) =>
    isValidString(visaKind) &&
    Object.values(VisaKind).includes(visaKind as VisaKind);

  const isUsLegalStatusValid = (status: any) =>
    isValidString(status) &&
    Object.values(UsLegalStatus).includes(status as UsLegalStatus);

  const isVisaExpirationDateValid = (dateStr: any) => {
    const isoDateString = getIsoDateString(dateStr, locale);
    if (!isoDateString) {
      return false;
    }
    const date = new Date(isoDateString);
    return date.getFullYear() > 1900 && date.getFullYear() < 3000;
  };

  const ValidatorByField: Record<IdDI, (...args: string[]) => boolean> = {
    [IdDI.email]: isEmailValid,
    [IdDI.phoneNumber]: isPhoneValid,
    [IdDI.firstName]: (value: any) => isNameValid(value),
    [IdDI.middleName]: (value: any) => isNameValid(value, true),
    [IdDI.lastName]: (value: any) => isNameValid(value),
    [IdDI.dob]: isDobValid,
    [IdDI.ssn9]: isSsn9Valid,
    [IdDI.ssn4]: isSsn4Valid,
    [IdDI.addressLine1]: isAddressLine1Valid,
    [IdDI.addressLine2]: isValidString,
    [IdDI.city]: isValidString,
    [IdDI.state]: (state: string, country?: string) =>
      isStateValid(state, country),
    [IdDI.country]: isCountryCode,
    [IdDI.zip]: isValidString,
    [IdDI.usLegalStatus]: isUsLegalStatusValid,
    [IdDI.citizenships]: isCitizenshipsValid,
    [IdDI.nationality]: isCountryCode,
    [IdDI.visaKind]: isVisaKindValid,
    [IdDI.visaExpirationDate]: isVisaExpirationDateValid,
  };

  // Ignore null or undefined values or invalid keys
  const filledEntries = Object.entries(userData).filter(
    ([key, value]) => key in ValidatorByField && !!value,
  ) as [string, any][];
  const filledData = Object.fromEntries(filledEntries);

  // If the values are provided, they should pass the validators
  const validatedEntries = filledEntries.filter(([key, value]) => {
    if (key === IdDI.state) {
      const country = filledData[IdDI.country];
      return !!ValidatorByField[IdDI.state](value, country);
    }
    return !!ValidatorByField[key as IdDI](value);
  });

  return Object.fromEntries(validatedEntries);
};

export default validateUserData;
