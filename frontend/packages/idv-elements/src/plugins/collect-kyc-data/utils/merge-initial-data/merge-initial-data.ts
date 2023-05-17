import { IdDI } from '@onefootprint/types';

import { KycData } from '../data-types';

const mergeInitialData = (
  initData: KycData,
  decryptedFields: KycData,
): KycData => {
  // TODO: We should really check that any initial data provided here is a full CDO - otherwise,
  // we may have bootstrap address mashed with decrypted address
  // If any address field is provided, ignore all decrypted address fields
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
