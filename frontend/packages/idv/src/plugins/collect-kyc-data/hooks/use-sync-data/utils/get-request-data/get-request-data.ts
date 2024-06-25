import type { SupportedLocale } from '@onefootprint/footprint-js';
import type { CollectKycDataRequirement, CollectedKycDataOption } from '@onefootprint/types';
import { CdoToAllDisMap, CollectedKycDataOptionToRequiredAttributes, IdDI } from '@onefootprint/types';

import { getLogger } from '../../../../../../utils/logger';
import { fromUSDateToISO8601Format, strInputToUSDate } from '../../../../../../utils/string';
import { isString } from '../../../../../../utils/type-guards';
import allAttributes from '../../../../utils/all-attributes';
import type { KycData } from '../../../../utils/data-types';

const { logInfo } = getLogger({ location: 'use-user-data' });

const isDate = (di: string) => di === IdDI.dob || di === IdDI.visaExpirationDate;

type RequestData = {
  data: Partial<Record<IdDI, string | string[]>>;
  bootstrapDis: IdDI[];
};

const getRequestData = (
  locale: SupportedLocale,
  data: KycData,
  requirement: CollectKycDataRequirement,
): RequestData => {
  const filteredData = Object.fromEntries(
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

  const cdos = allAttributes(requirement);

  // Make sure there are no dangling DIs in the filteredData. If there are,
  // add in the rest of the associated DIs (even though they may be
  // decrypted directly from backend), otherwise the backend will error
  Object.keys(CollectedKycDataOptionToRequiredAttributes).forEach((cdoKey: string) => {
    // Detect whether any part of the cdo is in request data
    const cdo = cdoKey as CollectedKycDataOption;
    const allDisForCdo = (CdoToAllDisMap[cdo] || []) as IdDI[];
    // "" is a valid value to save to the backend, so only check for undefined
    if (cdos.indexOf(cdo) === -1 || !allDisForCdo.some(di => typeof filteredData[di]?.value !== 'undefined')) {
      return;
    }

    // For each required DI, either try to add the value to the request data, or mark it as missing
    const requiredDisForCdo = CollectedKycDataOptionToRequiredAttributes[cdo];
    const missingDis = new Set<string>();
    requiredDisForCdo.forEach(di => {
      const value = data[di];
      if (typeof value?.value === 'undefined') {
        missingDis.add(di);
      } else if (!filteredData[di]?.value) {
        filteredData[di] = value;
      }
    });

    // Ignore missing state & zip DIs if address is international
    const isInternational = filteredData[IdDI.country]?.value !== 'US';
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

  // Construct the request data and make sure data formats are correct
  const bootstrapDis = Object.entries(filteredData)
    .filter(e => e[1].bootstrap)
    .map(e => e[0] as IdDI);
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

  return {
    data: requestData,
    bootstrapDis,
  };
};

export default getRequestData;
