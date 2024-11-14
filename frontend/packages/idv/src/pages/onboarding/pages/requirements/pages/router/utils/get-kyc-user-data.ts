import {
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  BusinessDI,
  IdDI,
} from '@onefootprint/types';
import pickBy from 'lodash/pickBy';

import type { BootstrapBusinessData, BusinessData, UserData } from '@/idv/types';
import { getLogger, isObject } from '@/idv/utils';

const { logInfo } = getLogger();

const BootstrapBusinessDIKeys: BusinessDI[] = Object.values(BusinessDI).filter(
  di => di !== BusinessDI.formationDate && di !== BusinessDI.formationState,
);

const isKeyIdDI = (_: unknown, key: IdDI) => Object.values(IdDI).includes(key);
const isKeyBusinessDIallowedInBootstrap = (_: unknown, key: BusinessDI) =>
  BootstrapBusinessDIKeys.concat(
    // TODO these aren't actually BusinessDIs
    BootstrapOnlyBusinessSecondaryOwnersKey as BusinessDI,
    BootstrapOnlyBusinessPrimaryOwnerStake as BusinessDI,
  ).includes(key);

export const filterUserData = (inObj: UserData & BusinessData): UserData => {
  if (!isObject(inObj)) return {};

  const outObj = pickBy(inObj, isKeyIdDI); // Filter down to keys of the IdDI enum
  const inKeys = Object.keys(inObj);
  const outKeys = Object.keys(outObj);

  if (outKeys.length > 0 && outKeys.length !== inKeys.length) {
    logInfo(`filterUserData: some keys were filtered out of the bootstrap data. ${inKeys.join(', ')}`);
  }

  return outObj;
};

export const filterBusinessData = (inObj: UserData & BusinessData): BootstrapBusinessData => {
  if (!isObject(inObj)) return {};

  const outObj = pickBy(inObj, isKeyBusinessDIallowedInBootstrap); // Filter down to keys of the BusinessDI enum + special case for "business.owners"
  const inKeys = Object.keys(inObj);
  const outKeys = Object.keys(outObj);

  if (outKeys.length > 0 && outKeys.length !== inKeys.length) {
    logInfo(`filterBusinessData: some keys were filtered out of the bootstrap data. ${inKeys.join(', ')}`);
  }

  return outObj;
};
