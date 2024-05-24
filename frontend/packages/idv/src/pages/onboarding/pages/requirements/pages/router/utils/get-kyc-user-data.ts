import { IdDI } from '@onefootprint/types';
import { pickBy } from 'lodash';

import type { UserData } from '../../../../../../../types';
import { Logger } from '../../../../../../../utils/logger';

const getKycUserData = (data: UserData): UserData => {
  // Filter down to keys of the IdDI enum
  const filtered = pickBy(data, (_, key) =>
    Object.values(IdDI).includes(key as IdDI),
  );
  if (
    data &&
    typeof data === 'object' &&
    Object.keys(filtered).length !== Object.keys(data).length
  ) {
    Logger.info(
      `getKycBootstrapData: some keys were filtered out of the bootstrap data. ${Object.keys(
        data,
      ).join(', ')}`,
    );
  }
  return filtered;
};

export default getKycUserData;
