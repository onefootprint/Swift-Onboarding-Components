import type { IdvBootstrapData, KycBootstrapData } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import { pickBy } from 'lodash';

const getKycBootstrapData = (data?: IdvBootstrapData): KycBootstrapData => {
  // Filter down to keys of the IdDI enum
  const filtered = pickBy(data, (_, key) =>
    Object.values(IdDI).includes(key as IdDI),
  );
  return filtered;
};

export default getKycBootstrapData;
