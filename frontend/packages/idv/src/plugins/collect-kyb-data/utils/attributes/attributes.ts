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

const isMissingDataFromCollection = (ctx: MachineContext, cdos?: CollectedKybDataOption[]): boolean => {
  const data = getBusinessDataFromContext(ctx);
  if (!Array.isArray(cdos)) return false;
  return cdos.flatMap(cdo => CollectedKybDataOptionToRequiredAttributes[cdo]).some(di => !data[di]);
};

export const isMissingRequiredData = (ctx: MachineContext): boolean => {
  return !ctx.kybRequirement ? false : isMissingDataFromCollection(ctx, ctx.kybRequirement.missingAttributes);
};

/**
 * Determines the intersection of the provided CDOs and the missing attributes from the KYB requirement.
 */
const missingAttributes = (ctx: MachineContext, cdos: CollectedKybDataOption[]) =>
  ctx.kybRequirement.missingAttributes.filter(cdo => cdos.includes(cdo));

export const isMissingBasicData = (ctx: MachineContext): boolean => {
  const basicCdos = [
    CollectedKybDataOption.name,
    CollectedKybDataOption.tin,
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.phoneNumber,
    CollectedKybDataOption.website,
  ];
  if (!ctx.kybRequirement) return false;
  const missingCdos = missingAttributes(ctx, basicCdos);
  return isMissingDataFromCollection(ctx, missingCdos);
};

export const isMissingAddressData = (ctx: MachineContext): boolean => {
  if (!ctx.kybRequirement) return false;
  const missingCdos = missingAttributes(ctx, [CollectedKybDataOption.address]);
  return isMissingDataFromCollection(ctx, missingCdos);
};

export const isMissingBeneficialOwnersData = (ctx: MachineContext): boolean => {
  if (!ctx.kybRequirement) return false;
  const data = getBusinessDataFromContext(ctx);
  const boCdos = [CollectedKybDataOption.beneficialOwners, CollectedKybDataOption.kycedBeneficialOwners];
  const missingCdos = missingAttributes(ctx, boCdos);

  const requiredDis = missingCdos.flatMap(cdo => CollectedKybDataOptionToRequiredAttributes[cdo]);
  return requiredDis.some(di => {
    const collectedData = data[di];
    return (
      !collectedData ||
      !Array.isArray(collectedData) ||
      collectedData.length === 0 ||
      collectedData.some(bOwner => !bOwner.first_name || !bOwner.last_name || !bOwner.ownership_stake)
    );
  });
};
