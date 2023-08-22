import {
  CdoToAllDisMap,
  CollectedKycDataOption,
  IdDI,
  IdDIData,
  OnboardingConfig,
} from '@onefootprint/types';
import { pickBy } from 'lodash';

import { KycData } from '../data-types';

const getInitData = (
  config: OnboardingConfig,
  bootstrapData?: IdDIData,
  disabledFields?: IdDI[],
): KycData => {
  const data: KycData = {};
  if (bootstrapData) {
    Object.entries(bootstrapData).forEach(([key, value]) => {
      data[key as IdDI] = {
        value,
        bootstrap: true,
      };
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
  const allKycCdos = new Set(Object.values(CollectedKycDataOption));
  const configKycCdos = config.mustCollectData.filter(cdo =>
    allKycCdos.has(cdo as CollectedKycDataOption),
  ) as CollectedKycDataOption[];
  const configKycAttributes = configKycCdos.flatMap(
    cdo => CdoToAllDisMap[cdo],
  ) as IdDI[];
  const filteredData = pickBy(data, (_, key) =>
    configKycAttributes.includes(key as IdDI),
  );

  return filteredData;
};

export default getInitData;
