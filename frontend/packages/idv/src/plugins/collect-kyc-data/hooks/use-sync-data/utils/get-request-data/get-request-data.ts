import { getIsoDate } from '@onefootprint/core';
import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CdoToAllDisMap, CollectedKycDataOptionToRequiredAttributes, IdDI } from '@onefootprint/types';

import { getLogger } from '../../../../../../utils/logger';
import { isUndefined } from '../../../../../../utils/type-guards';
import getAllKycAttributes from '../../../../utils/all-attributes';
import type { KycData } from '../../../../utils/data-types';

const { logInfo } = getLogger({ location: 'use-user-data' });

const isDate = (di: string) => di === IdDI.dob || di === IdDI.visaExpirationDate;

type RequestData = {
  data: Partial<Record<IdDI, string | string[]>>;
  bootstrapDis: IdDI[];
};

const getFilteredData = (data: KycData) => {
  return Object.fromEntries(
    Object.entries(data)
      // If the data was decrypted from the backend or is still encrypted, don't send it (by default)
      .filter(([, v]) => !v.decrypted && !v.scrubbed)
      // Only send dirty data
      .filter(([di, v]) => {
        if (v.bootstrap && !v.dirty) {
          logInfo(`${di} bootstrapped into flow and not marked as dirty`);
        }
        // TODO: i think we can change this to just `v.dirty` once we monitor logs
        return v.dirty || v.bootstrap;
      }),
  );
};

const getRequestData = (
  locale: SupportedLocale,
  data: KycData,
  requirement: CollectKycDataRequirement,
): RequestData => {
  const filteredData = getFilteredData(data);
  const kycAttributes = getAllKycAttributes(requirement);
  const requestData: Partial<Record<IdDI, string | string[]>> = {};

  // Construct the request data and make sure data formats are correct
  const bootstrapDis = Object.entries(filteredData)
    .filter(e => e[1].bootstrap)
    .map(e => e[0] as IdDI);

  // Make sure there are no dangling DIs in the filteredData. If there are,
  // add in the rest of the associated DIs (even though they may be
  // decrypted directly from backend), otherwise the backend will error
  (
    Object.keys(
      CollectedKycDataOptionToRequiredAttributes,
    ) as (keyof typeof CollectedKycDataOptionToRequiredAttributes)[]
  ).forEach(collectedKycDataOption => {
    // Detect whether any part of the cdo is in request data
    const attributesInDataOption = CdoToAllDisMap[collectedKycDataOption] || [];
    // "" is a valid value to save to the backend, so only check for undefined
    if (
      kycAttributes.indexOf(collectedKycDataOption) === -1 ||
      !attributesInDataOption.some(di => !isUndefined(filteredData[di]?.value))
    ) {
      return;
    }

    // For each required DI, either try to add the value to the request data, or mark it as missing
    const requiredDisForCdo = CollectedKycDataOptionToRequiredAttributes[collectedKycDataOption];
    const missingDis = new Set<string>();
    requiredDisForCdo.forEach(di => {
      const value = data[di];
      if (isUndefined(value?.value)) {
        missingDis.add(di);
      } else if (!filteredData[di]?.value) {
        filteredData[di] = value;
      }
    });

    // Ignore missing state & zip DIs if address is international
    const isNotUSCountry = filteredData[IdDI.country]?.value !== 'US';
    if (isNotUSCountry) {
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

  Object.entries(filteredData).forEach(([key, value]) => {
    const di = key as IdDI;
    if (isDate(di)) {
      requestData[di] = getIsoDate(value.value as string, locale);
    } else {
      requestData[di] = value.value;
    }
  });

  return {
    data: requestData,
    bootstrapDis,
  };
};

export default getRequestData;
