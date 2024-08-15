import { BusinessDI, IdDI } from '@onefootprint/types';
import pickBy from 'lodash/pickBy';

import type { BootstrapBusinessData, BusinessData, UserData } from '../../../../../../../types';
import { isObject } from '../../../../../../../utils';
import { getLogger } from '../../../../../../../utils/logger';

const { logInfo } = getLogger();

const BootstrapBusinessDIKeys: BusinessDI[] = Object.values(BusinessDI).filter(
  di =>
    di !== BusinessDI.beneficialOwners &&
    di !== BusinessDI.formationDate &&
    di !== BusinessDI.formationState &&
    di !== BusinessDI.kycedBeneficialOwners,
);

const isKeyBusinessDI = (_: unknown, key: BusinessDI) => BootstrapBusinessDIKeys.includes(key);
const isKeyIdDI = (_: unknown, key: IdDI) => Object.values(IdDI).includes(key);

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

  const outObj = pickBy(inObj, isKeyBusinessDI); // Filter down to keys of the BusinessDI enum
  const inKeys = Object.keys(inObj);
  const outKeys = Object.keys(outObj);

  if (outKeys.length > 0 && outKeys.length !== inKeys.length) {
    logInfo(`filterBusinessData: some keys were filtered out of the bootstrap data. ${inKeys.join(', ')}`);
  }

  return outObj;
};
