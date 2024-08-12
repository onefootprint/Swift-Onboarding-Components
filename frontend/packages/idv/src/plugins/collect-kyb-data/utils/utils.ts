import {
  BusinessDI,
  BusinessDIData,
  CollectedKybDataOption,
  CollectedKybDataOptionToRequiredAttributes,
  DecryptUserResponse,
  SupportedLocale,
} from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import { isObject, isStringValid } from '../../../utils';
import { fromUSDateToISO8601Format, isISO8601Format, strInputToUSDate } from '../../../utils/string';
import { BENEFICIAL_OWNER_ATTRIBUTE, BeneficialOwnerIdFields, IdField } from './constants';

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

const hasBeneficialOwnerDi = (
  userDi: IdField,
  boDi: BusinessDI.beneficialOwners | BusinessDI.kycedBeneficialOwners,
) => {
  const isContactInfo = ['id.email', 'id.phone_number'].includes(userDi);
  const isKycedBo = boDi === BusinessDI.kycedBeneficialOwners;
  // Only kyced BOs need to include contact info
  return !isContactInfo || isKycedBo;
};

/** Builds a beneficial owner from the provided userData, respecting whether the phone and email are required for the DI. */
export const buildBeneficialOwner = (
  userData: DecryptUserResponse,
  boDi: BusinessDI.beneficialOwners | BusinessDI.kycedBeneficialOwners,
) =>
  Object.fromEntries(
    BeneficialOwnerIdFields.filter(userDi => hasBeneficialOwnerDi(userDi, boDi))
      .map(userDi => {
        const businessOwnerKey = BENEFICIAL_OWNER_ATTRIBUTE[userDi];
        const userDataValue = isStringValid(userData[userDi]) ? userData[userDi] : undefined;
        return [businessOwnerKey, userDataValue];
      })
      .filter(([_key, value]) => Boolean(value)),
  );

export const omitEqualData = <T extends BusinessDIData>(vaultData: T | undefined | null, payload: T): T => {
  const output = {} as T;
  const AddressProps = CollectedKybDataOptionToRequiredAttributes[CollectedKybDataOption.address];

  if (!isObject(vaultData)) return payload;

  for (const key in payload) {
    // @ts-expect-error: key is a string
    if (AddressProps.includes(key) && !isEqual(payload[key], vaultData[key])) {
      output[BusinessDI.addressLine1] = payload[BusinessDI.addressLine1];
      output[BusinessDI.addressLine2] = payload[BusinessDI.addressLine2];
      output[BusinessDI.city] = payload[BusinessDI.city];
      output[BusinessDI.state] = payload[BusinessDI.state];
      output[BusinessDI.zip] = payload[BusinessDI.zip];
      output[BusinessDI.country] = payload[BusinessDI.country];
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
        return [
          key,
          isISO8601Format(value) ? value : fromUSDateToISO8601Format(strInputToUSDate(locale, value)) || undefined,
        ];
      }
      return [key, value];
    }),
  );
};
