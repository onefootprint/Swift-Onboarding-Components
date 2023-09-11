import type {
  CollectedKycDataOption,
  CollectKycDataRequirement,
} from '@onefootprint/types';
import {
  CollectedKycDataOptionToRequiredAttributes,
  IdDI,
} from '@onefootprint/types';
import { pickBy } from 'lodash';

import allAttributes from '../../../../utils/all-attributes';
import type { KycData } from '../../../../utils/data-types';

const isDate = (di: string) =>
  di === IdDI.dob || di === IdDI.visaExpirationDate;

const formatDate = (date?: string | string[]) => {
  if (!date || Array.isArray(date)) {
    return undefined;
  }
  const [month, day, year] = date.split('/');
  return `${year}-${month}-${day}`;
};

const getRequestData = (
  data: KycData,
  requirement: CollectKycDataRequirement,
  requireCompleteCdos?: boolean,
) => {
  // Filter out data that's already in the vault or has empty values
  const filteredData = pickBy(
    data,
    value => !value.decrypted && !value.scrubbed,
  );

  // Start constructing the request data, while making sure data formats are correct
  const requestData: Partial<Record<IdDI, string | string[]>> = {};
  Object.entries(filteredData).forEach(([key, value]) => {
    const di = key as IdDI;
    if (isDate(di)) {
      requestData[di] = formatDate(value.value);
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
  Object.keys(CollectedKycDataOptionToRequiredAttributes).forEach(
    (cdoKey: string) => {
      const cdo = cdoKey as CollectedKycDataOption;
      const requiredDis = CollectedKycDataOptionToRequiredAttributes[cdo];

      // Detect whether any part of the cdo is in request data
      const requestDataHasCdoEntry =
        cdos.indexOf(cdo) > -1 && requiredDis.some(di => requestData[di]);
      if (!requestDataHasCdoEntry) {
        return;
      }

      const danglingDis: string[] = [];
      requiredDis.forEach(di => {
        const value = data[di]?.value;
        if (typeof value === 'undefined') {
          danglingDis.push(di);
        } else if (!requestData[di]) {
          requestData[di] = value;
        }
      });

      if (danglingDis.length > 0) {
        throw new Error(`Dangling DIs: ${danglingDis.join(', ')}`);
      }
    },
  );

  return requestData;
};

export default getRequestData;
