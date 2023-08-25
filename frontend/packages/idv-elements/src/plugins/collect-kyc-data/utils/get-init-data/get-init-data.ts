import {
  CdoToAllDisMap,
  CollectedKycDataOption,
  IdDI,
  IdDIData,
} from '@onefootprint/types';
import { pickBy } from 'lodash';

import { KycData } from '../data-types';

const getInitData = (
  cdos: CollectedKycDataOption[],
  bootstrapData?: IdDIData,
  disabledFields?: IdDI[],
): KycData => {
  const data: KycData = {};
  if (bootstrapData) {
    Object.entries(bootstrapData).forEach(([key, value]) => {
      if (value) {
        data[key as IdDI] = {
          value: value as any,
          bootstrap: true,
        };
      }
    });
  }

  if (disabledFields) {
    disabledFields.forEach(field => {
      const entry = data[field];
      if (entry) {
        entry.disabled = true;
      }
    });
  }

  // Filter out fields that are not in the ob config
  // For now we only support bootstrapping KYC fields
  const configKycAttributes = cdos.flatMap(
    cdo => CdoToAllDisMap[cdo],
  ) as IdDI[];
  const filteredData = pickBy(data, (_, key) =>
    configKycAttributes.includes(key as IdDI),
  );

  return filteredData;
};

export default getInitData;
