import { getIsoDate, isValidIsoDate } from '@onefootprint/core';
import {
  type BeneficialOwner,
  BeneficialOwnerDataAttribute,
  BusinessDI,
  type BusinessDIData,
  CollectedKybDataOption,
  type DecryptUserResponse,
  type SupportedLocale,
} from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import { isObject, isStringValid } from '../../../utils';
import { BENEFICIAL_OWNER_ATTRIBUTE, BeneficialOwnerIdFields, BusinessAddressFields } from './constants';

export const omitNullAndUndefined = <T extends object>(data: T): T =>
  Object.entries(data).reduce((response, [key, value]) => {
    if (value != null) response[key] = value;
    return response;
  }, Object.create(null));

/** Returns the beneficial owner DI specified by the list of CDOs for a playbook. */
export const getBoDi = (allAttributes: CollectedKybDataOption[] | undefined) => {
  if (allAttributes?.includes(CollectedKybDataOption.beneficialOwners)) return BusinessDI.beneficialOwners;
  if (allAttributes?.includes(CollectedKybDataOption.kycedBeneficialOwners)) return BusinessDI.kycedBeneficialOwners;
};

/** Builds a beneficial owner from the provided userData, respecting whether the phone and email are required for the DI. */
export const buildBeneficialOwner = (
  userData: DecryptUserResponse,
  boDi: BusinessDI.beneficialOwners | BusinessDI.kycedBeneficialOwners,
) => {
  const bo = Object.fromEntries(
    BeneficialOwnerIdFields.map(userDi => {
      const businessOwnerKey = BENEFICIAL_OWNER_ATTRIBUTE[userDi];
      const userDataValue = isStringValid(userData[userDi]) ? userData[userDi] : undefined;
      return [businessOwnerKey, userDataValue];
    }).filter(([_key, value]) => Boolean(value)),
  );
  return omitIrrelevantData(bo, boDi);
};

const diIncludesField = (
  boDataAttribute: BeneficialOwnerDataAttribute,
  boDi: BusinessDI.beneficialOwners | BusinessDI.kycedBeneficialOwners,
) => {
  const isContactInfo = [BeneficialOwnerDataAttribute.email, BeneficialOwnerDataAttribute.phoneNumber].includes(
    boDataAttribute,
  );
  const isKycedBo = boDi === BusinessDI.kycedBeneficialOwners;
  // Only kyced BOs need to include contact info
  return !isContactInfo || isKycedBo;
};

/** Filters out contact info from BeneficialOwners if the playbook does not require kycing beneficial owners */
export const omitIrrelevantData = (
  bo: Partial<BeneficialOwner>,
  boDi: BusinessDI.beneficialOwners | BusinessDI.kycedBeneficialOwners,
) =>
  Object.fromEntries(
    Object.entries(bo).filter(([key, _value]) => diIncludesField(key as BeneficialOwnerDataAttribute, boDi)),
  );

export const omitEqualData = <T extends BusinessDIData>(vaultData: T | undefined | null, payload: T): T => {
  const output = {} as T;

  if (!isObject(vaultData)) return payload;

  for (const key in payload) {
    if (key === BusinessDI.doingBusinessAs && !isEqual(payload[key], vaultData[key])) {
      output[BusinessDI.name] = payload[BusinessDI.name];
      output[BusinessDI.doingBusinessAs] = payload[BusinessDI.doingBusinessAs];
      continue;
    }

    if (BusinessAddressFields.includes(key) && !isEqual(payload[key], vaultData[key])) {
      output[BusinessDI.addressLine1] = payload[BusinessDI.addressLine1];
      output[BusinessDI.addressLine2] = payload[BusinessDI.addressLine2];
      output[BusinessDI.city] = payload[BusinessDI.city];
      output[BusinessDI.state] = payload[BusinessDI.state];
      output[BusinessDI.zip] = payload[BusinessDI.zip];
      output[BusinessDI.country] = payload[BusinessDI.country];
      continue;
    }

    if (isObject(payload[key]) || Array.isArray(payload[key])) {
      if (!isEqual(payload[key], vaultData[key])) {
        output[key] = payload[key];
      }
    } else if (payload[key] !== vaultData[key]) {
      output[key] = payload[key];
    }
  }

  return output;
};

export const formatPayload = (locale: SupportedLocale, data: BusinessDIData): BusinessDIData => {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      if (key === BusinessDI.formationDate) {
        return [key, isValidIsoDate(value) ? value : getIsoDate(value, locale) || undefined];
      }
      return [key, value];
    }),
  );
};

export const isScrubbed = (str: unknown): str is 'scrubbed' => str === 'scrubbed';

export const formatTin = (tin?: string): string => {
  if (!tin) return '';
  const numericTin = tin.replace(/[^0-9]/g, '');
  return `${numericTin.slice(0, 2)}-${numericTin.slice(2)}`;
};

export const getTinDefaultValue = (tin?: string): string => {
  return !tin || isScrubbed(tin) ? '' : formatTin(tin);
};
