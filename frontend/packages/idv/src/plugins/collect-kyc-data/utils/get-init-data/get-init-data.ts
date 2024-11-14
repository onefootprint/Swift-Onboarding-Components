import type { CollectKycDataRequirement, IdDI } from '@onefootprint/types';
import { CdoToAllDisMap } from '@onefootprint/types';
import pickBy from 'lodash/pickBy';

import type { UserData } from '../../../../types';
import allAttributes from '../all-attributes';
import type { KycData } from '../data-types';

const getInitData = (requirement: CollectKycDataRequirement, bootstrapUserData: UserData): KycData => {
  const cdos = allAttributes(requirement);
  const data: KycData = {};
  Object.entries(bootstrapUserData).forEach(([key, value]) => {
    if (value) {
      data[key as IdDI] = {
        // @ts-expect-error
        value: value.value,
        bootstrap: value.isBootstrap,
      };
    }
  });

  // If a piece of data is passed into the collect KYC machine but doesn't exist on the backend,
  // we should immediately mark it as dirty
  [...requirement.missingAttributes, ...requirement.optionalAttributes]
    .flatMap(cdo => CdoToAllDisMap[cdo])
    .forEach(field => {
      const entry = data[field as IdDI];
      if (entry) {
        entry.dirty = true;
      }
    });

  // Filter out fields that are not in the ob config
  // For now we only support bootstrapping KYC fields
  const configKycAttributes = cdos.flatMap(cdo => CdoToAllDisMap[cdo]) as IdDI[];
  const filteredData = pickBy(data, (_, key) => configKycAttributes.includes(key as IdDI));

  return filteredData;
};

export default getInitData;
