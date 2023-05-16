import { IdDI, IdDIData } from '@onefootprint/types';

import { KycData } from '../data-types';

const getInitData = (
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

  return data;
};

export default getInitData;
