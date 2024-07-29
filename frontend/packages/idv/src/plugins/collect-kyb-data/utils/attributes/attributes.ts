import type { BeneficialOwner, BusinessDIData } from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import type { MachineContext } from '../state-machine/types';

const getRequiredAttributes = (ctx: MachineContext): CollectedKybDataOption[] => {
  const { missingAttributes, populatedAttributes } = ctx.kybRequirement || {};
  return (missingAttributes || []).concat(populatedAttributes || []);
};

const beneficialOwnerMapper = (beneficialOwner: BeneficialOwner): BeneficialOwner => {
  return Object.entries(beneficialOwner).reduce((output, [key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      if (key === 'firstName') output.first_name = value;
      if (key === 'middleName') output.middle_name = value;
      if (key === 'lastName') output.last_name = value;
      if (key === 'ownershipStake') output.ownership_stake = value;
      if (key === 'email') output.email = value;
      if (key === 'phoneNumber') output.phone_number = value;
    }
    return output;
  }, Object.create(null));
};

export const extractBootstrapBusinessDataValues = (obj: MachineContext['bootstrapBusinessData']): BusinessDIData => {
  return Object.entries(obj).reduce<BusinessDIData>((output, [k, v]): BusinessDIData => {
    if (v.value != null) {
      if (Array.isArray(v.value)) {
        /** @ts-expect-error: k is a string */
        output[k] = v.value.map(beneficialOwnerMapper);
        return output;
      }
      /** @ts-expect-error: k is a string */
      output[k] = v.value;
    }
    return output;
  }, Object.create(null));
};

export const getBusinessDataFromContext = (ctx: MachineContext): BusinessDIData => {
  return {
    ...extractBootstrapBusinessDataValues(ctx.bootstrapBusinessData),
    ...ctx.data,
  };
};

const isMissingDataFromCollection = (ctx: MachineContext, list?: CollectedKybDataOption[]): boolean => {
  const data = getBusinessDataFromContext(ctx);
  return !Array.isArray(list)
    ? false
    : list.some(reqId => {
        const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
        return requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
      });
};

export const isMissingRequiredData = (ctx: MachineContext): boolean => {
  return !ctx.kybRequirement ? false : isMissingDataFromCollection(ctx, getRequiredAttributes(ctx));
};

export const isMissingBasicData = (ctx: MachineContext): boolean => {
  const attrs = getRequiredAttributes(ctx);
  const data = getBusinessDataFromContext(ctx);
  const basic = [
    CollectedKybDataOption.name,
    CollectedKybDataOption.tin,
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.phoneNumber,
    CollectedKybDataOption.website,
  ];
  if (!ctx.kybRequirement) return false;

  return attrs.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return basic.includes(reqId) && requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};

export const isMissingAddressData = (ctx: MachineContext): boolean => {
  const attrs = getRequiredAttributes(ctx);
  const data = getBusinessDataFromContext(ctx);
  const address = [CollectedKybDataOption.address];

  if (!ctx.kybRequirement) return false;

  return attrs.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return address.includes(reqId) && requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};

export const isMissingBeneficialOwnersData = (ctx: MachineContext): boolean => {
  const attrs = getRequiredAttributes(ctx);
  const data = getBusinessDataFromContext(ctx);
  const propList = [CollectedKybDataOption.beneficialOwners, CollectedKybDataOption.kycedBeneficialOwners];

  if (!ctx.kybRequirement) return false;

  return attrs.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return (
      propList.includes(reqId) &&
      requiredAttributes &&
      requiredAttributes.some(vaultId => {
        const bOwners = data[vaultId];
        return (
          !bOwners ||
          !Array.isArray(bOwners) ||
          bOwners.length === 0 ||
          bOwners.some(bOwner => !bOwner.first_name || !bOwner.last_name || !bOwner.ownership_stake)
        );
      })
    );
  });
};
