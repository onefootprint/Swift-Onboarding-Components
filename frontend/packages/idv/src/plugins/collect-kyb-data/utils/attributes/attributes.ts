import {
  type BeneficialOwner,
  BeneficialOwnerDataAttribute,
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  BusinessDI,
  type BusinessDIData,
  CdoToAllDisMap,
  type CollectKybDataRequirement,
  type DecryptUserResponse,
} from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import { isStringValid } from '../../../../utils';
import { BeneficialOwnerIdFields } from '../constants';
import type { MachineContext } from '../state-machine/types';
import { buildBeneficialOwner, getBoDi, omitIrrelevantData } from '../utils';

type CustomBusinessDI =
  | BusinessDI
  | typeof BootstrapOnlyBusinessSecondaryOwnersKey
  | typeof BootstrapOnlyBusinessSecondaryOwnersKey;

export const BO_FIELDS: BusinessDI[] = [BusinessDI.beneficialOwners, BusinessDI.kycedBeneficialOwners];

export const extractNonBoBootstrapValues = (filteredObj: MachineContext['bootstrapBusinessData']): BusinessDIData => {
  const ignoreFields = [...BO_FIELDS, BootstrapOnlyBusinessSecondaryOwnersKey, BootstrapOnlyBusinessPrimaryOwnerStake];

  return Object.fromEntries(
    Object.entries(filteredObj)
      .filter(([k, v]) => v.value != null && !ignoreFields.includes(k))
      .map(([k, v]) => [k, v.value] as const),
  );
};

/** Given the `userData` (either from bootstrap or decrypted) and the `bootstrapBusinessData`, computes the set of beneficial owners. The primary BO is composed from `id.xxx` attributes and `business.primary_owner_stake`. All other BOs are composed from `business.secondary_owners` */
export const computeBosValue = (
  kybRequirement: CollectKybDataRequirement,
  userData: DecryptUserResponse,
  bootstrapBusinessData: MachineContext['bootstrapBusinessData'],
) => {
  const cdos = [...(kybRequirement.populatedAttributes || []), ...kybRequirement.missingAttributes];
  const boDi = getBoDi(cdos);

  if (!boDi) return {};

  const primaryOwner: Partial<BeneficialOwner> = {
    ...buildBeneficialOwner(userData, boDi),
    [BeneficialOwnerDataAttribute.ownershipStake]:
      bootstrapBusinessData?.[BootstrapOnlyBusinessPrimaryOwnerStake]?.value,
  };

  const secondaryOwners = bootstrapBusinessData[BootstrapOnlyBusinessSecondaryOwnersKey]?.value || [];
  const allBeneficialOwners = [primaryOwner, ...secondaryOwners];

  const filteredBeneficialOwners = allBeneficialOwners.map(bo => omitIrrelevantData(bo, boDi));

  const onlyEmptyBos = allBeneficialOwners.every(bo => Object.values(bo).every(v => !v));
  if (onlyEmptyBos) {
    return {};
  }

  return { [boDi]: filteredBeneficialOwners };
};

export const extractBoBootstrapValues = (ctx: MachineContext): BusinessDIData => {
  // Compute the primary BO from the combination if `id.xxx` data and `business.primary_owner_stake`.
  // Even if no identity data is provided, we should always start with an empty primary BO in case secondary
  // BOs are added on.
  const userData: DecryptUserResponse = Object.fromEntries(
    Object.entries(ctx?.bootstrapUserData || {})
      .filter(([k, _v]) => BeneficialOwnerIdFields.includes(k as (typeof BeneficialOwnerIdFields)[0]))
      .map(([k, v]) => [k, v.value])
      .filter(([_k, v]) => isStringValid(v)),
  );

  return computeBosValue(ctx.kybRequirement, userData, ctx.bootstrapBusinessData);
};

export const getBusinessDataFromContext = (ctx: MachineContext): BusinessDIData => {
  const cdos = [...(ctx.kybRequirement.populatedAttributes || []), ...ctx.kybRequirement.missingAttributes];
  const kybDiAttributes = cdos.flatMap(cdo => CdoToAllDisMap[cdo]) as CustomBusinessDI[];

  const filteredBootstrapBusinessData = pickBy(ctx.bootstrapBusinessData, (_, key) => {
    const kybDiAttributesWithCustomBootstrap = kybDiAttributes.concat(BootstrapOnlyBusinessSecondaryOwnersKey);
    return kybDiAttributesWithCustomBootstrap.includes(key as CustomBusinessDI);
  });

  const nonBoValues = extractNonBoBootstrapValues(filteredBootstrapBusinessData);
  const boValues = extractBoBootstrapValues(ctx);

  const initialData = /** This order is important */ {
    ...nonBoValues,
    ...boValues,
    ...ctx.data,
  };

  if (ctx.kybRequirement.hasLinkedBos) {
    // If BOs are linked via API already, we don't support working with them in IDV.
    BO_FIELDS.forEach(di => {
      if (initialData[di]) {
        console.warn(`${di} provided when they are already linked`);
      }
      initialData[di] = undefined;
    });
  }

  return omit(initialData, [BootstrapOnlyBusinessSecondaryOwnersKey, BootstrapOnlyBusinessPrimaryOwnerStake]);
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
