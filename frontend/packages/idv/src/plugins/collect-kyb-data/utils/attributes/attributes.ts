import type { BeneficialOwner, BusinessDIData } from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import type { MachineContext } from '../state-machine/types';

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

export const hasAnyMissingRequiredAttribute = (ctx: MachineContext): boolean => {
  const data = getBusinessDataFromContext(ctx);
  if (!ctx.kybRequirement || !Array.isArray(ctx.kybRequirement.missingAttributes)) return false;

  return ctx.kybRequirement.missingAttributes.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};

export const hasMissingBasicData = (ctx: MachineContext): boolean => {
  const data = getBusinessDataFromContext(ctx);
  const basic = [
    CollectedKybDataOption.name,
    CollectedKybDataOption.tin,
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.phoneNumber,
    CollectedKybDataOption.website,
  ];
  if (!ctx.kybRequirement || !Array.isArray(ctx.kybRequirement.missingAttributes)) return false;

  return ctx.kybRequirement.missingAttributes.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return basic.includes(reqId) && requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};

export const hasMissingAddressData = (ctx: MachineContext): boolean => {
  const data = getBusinessDataFromContext(ctx);
  const address = [CollectedKybDataOption.address];
  if (!ctx.kybRequirement || !Array.isArray(ctx.kybRequirement.missingAttributes)) return false;

  return ctx.kybRequirement.missingAttributes.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return address.includes(reqId) && requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};

export const hasMissingBeneficialOwners = (ctx: MachineContext): boolean => {
  const data = getBusinessDataFromContext(ctx);
  const beneficialOwners = [CollectedKybDataOption.beneficialOwners, CollectedKybDataOption.kycedBeneficialOwners];
  if (!ctx.kybRequirement || !Array.isArray(ctx.kybRequirement.missingAttributes)) return false;

  return ctx.kybRequirement.missingAttributes.some(reqId => {
    const requiredAttributes = CollectedKybDataOptionToRequiredAttributes[reqId];
    return beneficialOwners.includes(reqId) && requiredAttributes && requiredAttributes.some(vaultId => !data[vaultId]);
  });
};
