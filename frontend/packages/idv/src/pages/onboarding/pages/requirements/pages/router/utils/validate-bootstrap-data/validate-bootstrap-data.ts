import {
  getIsoDate,
  isAddressLine,
  isEinFormat,
  isEmail,
  isName,
  isPhoneNumber,
  isSSN9Flexible,
  isSsn4,
  isURL,
} from '@onefootprint/core';
import type { SupportedLocale } from '@onefootprint/footprint-js';
import { STATES } from '@onefootprint/global-constants';
import {
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  CorporationType,
} from '@onefootprint/types';
import type { CountryCode, PublicOnboardingConfig } from '@onefootprint/types';
import {
  type BootstrapIgnoredBusinessDI,
  BusinessDI,
  IdDI,
  type IdvBootstrapData,
  UsLegalStatus,
  VisaKind,
  isCountryCode,
} from '@onefootprint/types';
import isFuture from 'date-fns/isFuture';
import snakeCase from 'lodash/snakeCase';

// TODO: Fix this
import type { BusinessData, DIMetadata, UserData } from '../../../../../../../../types';
import { isNumber, isObject, isStringValid } from '../../../../../../../../utils';
import { getLogger } from '../../../../../../../../utils/logger';

// biome-ignore lint/suspicious/noExplicitAny: This is intentional
type Predicate = (...args: any[]) => boolean;
type BusinessDICustom =
  | Exclude<BusinessDI, BootstrapIgnoredBusinessDI>
  | typeof BootstrapOnlyBusinessSecondaryOwnersKey
  | typeof BootstrapOnlyBusinessPrimaryOwnerStake;
type NotValidatedUserData = Partial<{ [K in IdDI | BusinessDICustom]: DIMetadata<unknown> }>;

const { logWarn } = getLogger({ location: 'validate-bootstrap-data' });

const validate = ({
  bootstrapData,
  config,
  locale = 'en-US',
}: {
  bootstrapData: NotValidatedUserData;
  config: PublicOnboardingConfig;
  locale?: SupportedLocale;
}): UserData & BusinessData => {
  if (!isObject(bootstrapData)) return {};

  const FieldsValidator: Record<IdDI | BusinessDICustom, Predicate> = {
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
    [IdDI.phoneNumber]: (value: string) => isPhoneNumber(value),
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
    [BusinessDI.city]: isStringValid,
    [BusinessDI.corporationType]: isCorporationTypeValid,
    [BusinessDI.country]: (s: string) => isCountryValid(config, s),
    [BusinessDI.doingBusinessAs]: isStringValid,
    [BusinessDI.name]: isStringValid,
    [BusinessDI.phoneNumber]: (value: string) => isPhoneNumber(value),
    [BusinessDI.state]: (state: string, country?: string) => isStateValid(state, country),
    [BusinessDI.tin]: value => isEinFormat(value),
    [BusinessDI.website]: value => isURL(value),
    [BusinessDI.zip]: isStringValid,
    [BootstrapOnlyBusinessPrimaryOwnerStake]: isNumber,
    [BootstrapOnlyBusinessSecondaryOwnersKey]: owners => isBusinessOwnersValid(owners),
  };

  // Ignore null or undefined values or invalid keys
  const filledEntries = Object.entries(bootstrapData).filter(([k, v]) => k in FieldsValidator && !!v?.value);
  const filledData = Object.fromEntries(filledEntries);

  // If the values are provided, they should pass the validators
  const validatedEntries = filledEntries.filter(([key, metaData]) => {
    if (key === IdDI.state) {
      const country = filledData[IdDI.country];
      return !!FieldsValidator[IdDI.state](metaData.value as string, country?.value as string);
    }
    if (key === BusinessDI.state) {
      const country = filledData[BusinessDI.country];
      return !!FieldsValidator[BusinessDI.state](metaData.value as string, country?.value as string);
    }
    return !!FieldsValidator[key as IdDI](metaData.value as string);
  });

  const finalBootstrapEntries = validatedEntries.map(([key, metaData]) => {
    if (key === BootstrapOnlyBusinessSecondaryOwnersKey) {
      // Since bootstrap data _can_ be fetched from the SDK args API, our case converter is automatically
      // transforming keys (except DIs) from snake_case to camelCase.
      // Here, we map them back for benficial owners
      // TODO maybe we should disable the case converter in SDK args?
      const { value, ...restOfValue } = metaData;
      const snakeCaseBos = (metaData.value as object[]).map(bo =>
        Object.fromEntries(Object.entries(bo).map(([k, v]) => [snakeCase(k), v])),
      );
      const newValue = {
        value: snakeCaseBos,
        ...restOfValue,
      };
      return [key, newValue];
    }

    /**
     * Normalize date inputs to be bootstrapped as
     * - DD/MM/YYYY for 'es-MX'
     * - MM/DD/YYYY for 'en-US' the fallback locale
     */
    if (key === IdDI.dob || key === IdDI.visaExpirationDate || key === BusinessDI.formationDate) {
      const { value, ...rest } = metaData;
      const strIsoDate = getIsoDate(metaData.value as string, locale);

      return [
        key,
        {
          ...rest,
          value: strIsoDate,
        },
      ];
    }

    return [key, metaData];
  });

  const validatedData = Object.fromEntries(finalBootstrapEntries);
  const validatedKeys = new Set(Object.keys(validatedData));
  const allKeys = Object.keys(bootstrapData) as IdDI[];
  const invalidKeys = allKeys.filter(key => !validatedKeys.has(key));

  if (invalidKeys.length) {
    logWarn(`Filtering out invalid bootstrapped user data for keys: ${invalidKeys.join(', ')}`);
  }

  return Object.fromEntries(finalBootstrapEntries);
};

const isNameValid = (str: string, allowEmpty?: boolean): boolean => {
  return !allowEmpty && !str?.trim()?.length ? false : isName(str);
};

const isStateValid = (state: string, country?: string): boolean => {
  return country === 'US' ? STATES.some(s => s.value === state) : isStringValid(state);
};

export const isDobValid = (locale: SupportedLocale, dob: string): boolean => {
  const isoDateString = getIsoDate(dob, locale);
  if (!isoDateString) return false;

  const dobDate = new Date(isoDateString);
  if (dobDate.getFullYear() < 1900 || isFuture(dobDate)) return false;

  const daysOnEarth = (new Date().getTime() - dobDate.getTime()) / (1000 * 3600 * 24);
  const minValidAge = 18;

  return daysOnEarth / 365 >= minValidAge;
};

const isVisaExpirationDateValid = (locale: SupportedLocale, dateStr: string): boolean => {
  const isoDateString = getIsoDate(dateStr, locale);
  if (!isoDateString) return false;

  const date = new Date(isoDateString);
  return date.getFullYear() > 1900 && date.getFullYear() < 3000;
};

const isCitizenshipsValid = (strOrArray: string): boolean => {
  return Array.isArray(strOrArray) && strOrArray.every(c => isCountryCode(c));
};

const isVisaKindValid = (str: string): boolean => {
  return isStringValid(str) && Object.values(VisaKind).includes(str as VisaKind);
};

const isUsLegalStatusValid = (str: string): boolean => {
  return isStringValid(str) && Object.values(UsLegalStatus).includes(str as UsLegalStatus);
};

const isCountryValid = (config: PublicOnboardingConfig, country: string): boolean => {
  if (!isCountryCode(country)) return false;
  if (config.supportedCountries?.length) {
    return config.supportedCountries.includes(country as CountryCode);
  }
  return true;
};

const isCorporationTypeValid = (str: string): boolean => {
  return isStringValid(str) && Object.values(CorporationType).includes(str as CorporationType);
};

export const isBusinessOwnersValid = (owners: IdvBootstrapData[typeof BootstrapOnlyBusinessSecondaryOwnersKey]) => {
  if (!owners || !Array.isArray(owners) || owners.length < 1) return false;
  if (owners.some(owner => !isObject(owner) || !Object.keys(owner).length)) return false;

  const hasInvalidField = owners.some(owner =>
    Object.entries(owner).some(([k, value]) => {
      const key = snakeCase(k);
      return (
        (key === 'first_name' && (!isStringValid(value) || !isName(value))) ||
        (key === 'last_name' && (!isStringValid(value) || !isName(value))) ||
        (key === 'email' && (!isStringValid(value) || !isEmail(value))) ||
        (key === 'phone_number' && (!isStringValid(value) || !isPhoneNumber(value))) ||
        (key === 'ownership_stake' && (typeof value !== 'number' || value < 0 || value > 100))
      );
    }),
  );

  return !hasInvalidField;
};

export default validate;
