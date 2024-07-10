import { BusinessDI, IdDI } from '@onefootprint/types';
import { pickBy } from 'lodash';

import type { BusinessData, UserData } from '../../../../../../../types';
import { isObject } from '../../../../../../../utils';
import { getLogger } from '../../../../../../../utils/logger';

const { logInfo } = getLogger();

const isKeyBusinessDI = (_: unknown, key: BusinessDI) => Object.values(BusinessDI).includes(key);
const isKeyIdDI = (_: unknown, key: IdDI) => Object.values(IdDI).includes(key);

export const filterUserData = (data: UserData & BusinessData): UserData => {
  const filtered = pickBy(data, isKeyIdDI); // Filter down to keys of the IdDI enum
  const dataKeys = Object.keys(data);

  if (isObject(data) && Object.keys(filtered).length !== dataKeys.length) {
    logInfo(`filterUserData: some keys were filtered out of the bootstrap data. ${dataKeys.join(', ')}`);
  }

  return filtered;
};

export const filterBusinessData = (data: UserData & BusinessData): BusinessData => {
  const filtered = pickBy(data, isKeyBusinessDI); // Filter down to keys of the BusinessDI enum
  const dataKeys = Object.keys(data);

  if (isObject(data) && Object.keys(filtered).length !== dataKeys.length) {
    logInfo(`filterBusinessData: some keys were filtered out of the bootstrap data. ${dataKeys.join(', ')}`);
  }

  return filtered;
};
