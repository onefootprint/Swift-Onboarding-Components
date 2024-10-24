import type { BeneficialOwner } from '@onefootprint/types';

import { uuidv4 } from '@onefootprint/dev-tools';
import type { BusinessOwnerData, BusinessOwnerPatchOperation } from '@onefootprint/idv';
import type { HostedBusinessOwner } from '@onefootprint/services';
import { BeneficialOwnerDataAttribute } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import type { UserData } from '../../../../types';
import { omitNullAndUndefined } from '../../utils/utils';
import type { BeneficialOwnerWithMetadata } from './components/form/types';

export const getTotalOwnershipStake = (beneficialOwners: BeneficialOwner[]): number => {
  return beneficialOwners
    .map(bo => Number(bo[BeneficialOwnerDataAttribute.ownershipStake]))
    .reduce((total, stake) => total + stake, 0);
};

/** @deprecated
 * This function should never be called.
 * The bootstrap data is handled here "business-fields-loader/business-fields-loader.tsx" */
export const getDefaultFormDataWithBootstrap = (bootstrapUserData: Readonly<UserData>): BeneficialOwnerWithMetadata => {
  return {
    _uuid: uuidv4(),
    [BeneficialOwnerDataAttribute.firstName]: bootstrapUserData?.[IdDI.firstName]?.value ?? '',
    [BeneficialOwnerDataAttribute.middleName]: bootstrapUserData?.[IdDI.middleName]?.value ?? '',
    [BeneficialOwnerDataAttribute.lastName]: bootstrapUserData?.[IdDI.lastName]?.value ?? '',
    [BeneficialOwnerDataAttribute.email]: bootstrapUserData?.[IdDI.email]?.value ?? '',
    [BeneficialOwnerDataAttribute.phoneNumber]: bootstrapUserData?.[IdDI.phoneNumber]?.value ?? '',
    [BeneficialOwnerDataAttribute.ownershipStake]: 0,
  };
};

const mapFormBoToPatchData = (formBo: BeneficialOwnerWithMetadata) => {
  return {
    [IdDI.firstName]: formBo[BeneficialOwnerDataAttribute.firstName],
    [IdDI.middleName]: formBo[BeneficialOwnerDataAttribute.middleName],
    [IdDI.lastName]: formBo[BeneficialOwnerDataAttribute.lastName],
    [IdDI.email]: formBo[BeneficialOwnerDataAttribute.email],
    [IdDI.phoneNumber]: formBo[BeneficialOwnerDataAttribute.phoneNumber],
  };
};

const isCreateDataValid = (formBo: BeneficialOwnerWithMetadata) => {
  return (
    Boolean(formBo[BeneficialOwnerDataAttribute.firstName]) &&
    Boolean(formBo[BeneficialOwnerDataAttribute.lastName]) &&
    Boolean(formBo[BeneficialOwnerDataAttribute.email]) &&
    Boolean(formBo[BeneficialOwnerDataAttribute.phoneNumber]) &&
    formBo[BeneficialOwnerDataAttribute.ownershipStake] >= 0
  );
};

export const getBusinessOwnerPatchOperations = (
  currentOwners: HostedBusinessOwner[],
  formOwners: BeneficialOwnerWithMetadata[],
): BusinessOwnerPatchOperation[] => {
  const boStake = BeneficialOwnerDataAttribute.ownershipStake;
  const boDetailsByUuid = Object.fromEntries(currentOwners.map(({ uuid, ...props }) => [uuid, props]));
  const updateOperations: BusinessOwnerPatchOperation[] = [];
  const createOperations: BusinessOwnerPatchOperation[] = [];

  formOwners.forEach(formBo => {
    if (formBo?._uuid) {
      const persistedBo = boDetailsByUuid[formBo._uuid] || undefined;
      const formBoData = omitNullAndUndefined(mapFormBoToPatchData(formBo));

      /** Remove properties that already exist in persistedBo.decryptedData */
      const payload = persistedBo
        ? Object.fromEntries(
            Object.entries(formBoData).filter(([key, value]) => persistedBo.decryptedData[key as IdDI] !== value),
          )
        : formBoData;

      const isPayloadEmpty = Object.keys(payload).length === 0;
      const isPayloadEqual = isPayloadEmpty || isEqual(payload, persistedBo?.decryptedData);
      const isStakeEqual = formBo[boStake] === persistedBo?.ownershipStake;
      const isEqualPayloadAndStake = isPayloadEqual && isStakeEqual;

      if (persistedBo && !isEqualPayloadAndStake) {
        updateOperations.push({
          op: 'update' as const,
          uuid: formBo._uuid,
          data: payload,
          ownershipStake: formBo[boStake],
        });
      } else if (!persistedBo) {
        if (isCreateDataValid(formBo)) {
          createOperations.push({
            op: 'create' as const,
            uuid: formBo._uuid,
            data: omitNullAndUndefined(mapFormBoToPatchData(formBo)) as BusinessOwnerData,
            ownershipStake: formBo[boStake],
          });
        }
      }
    }
  });

  const deleteOperations = currentOwners
    .filter(currentBo => !formOwners.some(formBo => formBo._uuid === currentBo.uuid))
    .map(currentBo => ({ op: 'delete' as const, uuid: currentBo.uuid }));

  return [...updateOperations, ...createOperations, ...deleteOperations];
};
