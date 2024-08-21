import { BusinessDI, type BusinessDIData, CdoToAllDisMap, type DecryptUserResponse } from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import pickBy from 'lodash/pickBy';
import { isStringValid } from '../../../../utils';
import { BeneficialOwnerIdFields } from '../constants';
import type { MachineContext } from '../state-machine/types';
import { buildBeneficialOwner, getBoDi } from '../utils';

export const BO_FIELDS: BusinessDI[] = [BusinessDI.beneficialOwners, BusinessDI.kycedBeneficialOwners];

export const extractBootstrapBusinessDataValues = (obj: MachineContext['bootstrapBusinessData']): BusinessDIData =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([_k, v]) => v.value != null)
      .map(([k, v]) => [k, v.value] as const),
  );

export const extractBusinessOwnerValuesFromBootstrapUserData = (ctx?: MachineContext): BusinessDIData => {
  /* Ignore when business owners kind are not missing */
  const boDi = getBoDi(ctx?.kybRequirement?.missingAttributes);
  if (!boDi) return {};

  /* Ignore when business owners kind are populated */
  if (ctx?.data?.[boDi] != null) return {};

  const userData: DecryptUserResponse = Object.fromEntries(
    Object.entries(ctx?.bootstrapUserData || {})
      .filter(([k, _v]) => BeneficialOwnerIdFields.includes(k as (typeof BeneficialOwnerIdFields)[0]))
      .map(([k, v]) => [k, v.value])
      .filter(([_k, v]) => isStringValid(v)),
  );

  /* Ignore when there is no relevant business data in the user data */
  if (Object.keys(userData).length === 0) return {};

  return { [boDi]: [buildBeneficialOwner(userData, boDi)] };
};

export const getBusinessDataFromContext = (ctx: MachineContext): BusinessDIData => {
  const cdos = [...(ctx.kybRequirement?.populatedAttributes || []), ...(ctx.kybRequirement?.missingAttributes || [])];
  const kybAttributes = cdos.flatMap(cdo => CdoToAllDisMap[cdo]) as BusinessDI[];
  const filteredBootstrapBusinessData = pickBy(ctx.bootstrapBusinessData, (_, key) =>
    kybAttributes.includes(key as BusinessDI),
  );

  // TODO i think some strange things will happen if the user data is bootstrapped AND the business.beneficial_owners is bootstrap
  const initialData = /** This order is important */ {
    ...extractBootstrapBusinessDataValues(filteredBootstrapBusinessData),
    ...extractBusinessOwnerValuesFromBootstrapUserData(ctx),
    ...ctx.data,
  };
  if (ctx?.kybRequirement?.hasLinkedBos) {
    // If BOs are linked via API already, we don't support working with them in IDV.
    BO_FIELDS.forEach(di => {
      if (initialData[di]) {
        console.warn(`${di} provided when they are already linked`);
      }
      initialData[di] = undefined;
    });
  }
  return initialData;
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
  if (ctx.kybRequirement.hasLinkedBos) return false;
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
