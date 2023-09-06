import { IdDI } from '@onefootprint/types';

import { KycData } from '../../../data-types';

const mergeInitialData = (
  initData: KycData,
  decryptedFields: KycData,
): KycData => {
  const newValues = Object.fromEntries(
    Object.entries(decryptedFields).filter(
      // Don't allow replacing bootstrap data with decrypted data - the bootstrap
      // data should take precedent
      ([k]) => !initData[k as IdDI],
    ),
  );

  return {
    ...initData,
    ...newValues,
  };
};

export default mergeInitialData;
