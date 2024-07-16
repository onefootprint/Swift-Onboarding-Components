import type { IdDI } from '@onefootprint/types';

import type { KycData } from '@/types';

const mergeUpdatedData = (data: KycData, newData: KycData): KycData => {
  // Only allow the update if data has changed.
  // The existing entry has metadata telling us if it came from the existing vault -
  // we only want to overwrite it if the value has changed.
  const newValues = Object.fromEntries(Object.entries(newData).filter(([k, v]) => data[k as IdDI]?.value !== v.value));

  return {
    ...data,
    ...newValues,
  };
};

export default mergeUpdatedData;
