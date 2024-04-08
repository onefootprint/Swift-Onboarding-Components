import type { CollectedKycDataOption, IdDI } from '@onefootprint/types';
import { CdoToAllDisMap } from '@onefootprint/types';
import { pickBy } from 'lodash';

import type { UserData } from '../../../../types';
import type { KycData } from '../data-types';

const getInitData = (
  cdos: CollectedKycDataOption[],
  userData: UserData,
  disabledFields?: IdDI[],
): KycData => {
  const data: KycData = {};
  Object.entries(userData).forEach(([key, value]) => {
    if (value) {
      data[key as IdDI] = {
        // @ts-expect-error
        value: value.value,
        bootstrap: value.isBootstrap,
      };
    }
  });

  // Used for fields that are autofilled in the KYB machine
  if (disabledFields) {
    disabledFields.forEach(field => {
      const entry = data[field];
      if (entry) {
        entry.disabled = true;
        entry.dirty = true;
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
