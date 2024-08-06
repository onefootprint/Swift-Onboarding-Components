import type { CollectKycDataRequirement, CollectedKycDataOption } from '@onefootprint/types';
import { CdoToAllDisMap, CollectedKycDataOptionToRequiredAttributes, IdDI } from '@onefootprint/types';
import pickBy from 'lodash/pickBy';

import type { KycData } from '@/types';
import allAttributes from '@/utils/all-attributes';
import { fromUSDateToISO8601Format, strInputToUSDate } from '@/utils/string';

const isString = (x: unknown): x is string => typeof x === 'string';
const isDate = (di: string) => di === IdDI.dob || di === IdDI.visaExpirationDate;

const getRequestData = (
  locale: 'en-US' | 'es-MX', // TODO: use SupportedLocale
  data: KycData,
  requirement: CollectKycDataRequirement,
  requireCompleteCdos?: boolean,
) => {
  // Filter out data that's already in the vault or has empty values
  const filteredData = pickBy(data, value => !value.decrypted && !value.scrubbed);

  // Start constructing the request data, while making sure data formats are correct
  const requestData: Partial<Record<IdDI, string | string[]>> = {};
  Object.entries(filteredData).forEach(([key, value]) => {
    const di = key as IdDI;
    if (isDate(di)) {
      const dateInputValue = isString(value.value) ? strInputToUSDate(locale, value.value) : undefined;

      requestData[di] = fromUSDateToISO8601Format(dateInputValue);
    } else {
      requestData[di] = value.value;
    }
  });

  if (!requireCompleteCdos) {
    return requestData;
  }

  // cdos includes the populated attributes too in case they got edited
  const cdos = allAttributes(requirement);

  // Make sure there are no dangling DIs in the data. If there are,
  // add in the rest of the associated DIs (even though they may be
  // decrypted directly from backend), otherwise the backend will error
  Object.keys(CollectedKycDataOptionToRequiredAttributes).forEach((cdoKey: string) => {
    // Detect whether any part of the cdo is in request data
    const cdo = cdoKey as CollectedKycDataOption;
    const allDisForCdo = CdoToAllDisMap[cdo] as IdDI[];
    if (cdos.indexOf(cdo) === -1 || !allDisForCdo.some(di => requestData[di])) {
      return;
    }

    // For each required DI, either try to add the decrypted value to the request data
    // Or mark it as missing
    const requiredDisForCdo = CollectedKycDataOptionToRequiredAttributes[cdo];
    const missingDis = new Set<string>();
    requiredDisForCdo.forEach(di => {
      const value = data[di]?.value;
      if (typeof value === 'undefined') {
        missingDis.add(di);
      } else if (!requestData[di]) {
        requestData[di] = value;
      }
    });

    // Ignore missing state & zip DIs if address is international
    const isInternational = requestData[IdDI.country] !== 'US';
    if (isInternational) {
      missingDis.delete(IdDI.state);
      missingDis.delete(IdDI.zip);
    }

    // If the missing DIs form cdo groups that are all already populated in the backend, ignore
    requirement.populatedAttributes.forEach(populatedCdo => {
      const populatedDis = CdoToAllDisMap[populatedCdo];
      const allInMissingDis = populatedDis.every(di => missingDis.has(di));
      if (allInMissingDis) {
        populatedDis.forEach(di => missingDis.delete(di));
      }
    });

    if (missingDis.size > 0) {
      throw new Error(`Missing required DIs: ${Array.from(missingDis).join(', ')}`);
    }
  });

  return requestData;
};

export default getRequestData;
