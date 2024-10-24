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

const shouldRecollect = (ctx: MachineContext, cdos: CollectedKybDataOption[]) => {
  return ctx.kybRequirement.recollectAttributes.some(cdo => cdos.includes(cdo));
};

/** Given a list of CDOs, returns whether we are missing any underlying data for the CDOs. */
const isMissingAnyData = (ctx: MachineContext, cdos: CollectedKybDataOption[]): boolean => {
  const data = getBusinessDataFromContext(ctx);
  const missingCdos = ctx.kybRequirement.missingAttributes.filter(cdo => cdos.includes(cdo));
  return missingCdos.flatMap(cdo => CollectedKybDataOptionToRequiredAttributes[cdo]).some(di => !data[di]);
};

export const isCollectingBusinessData = (ctx: MachineContext): boolean => {
  const allAttributes = [...ctx.kybRequirement.populatedAttributes, ...ctx.kybRequirement.missingAttributes];
  return isMissingAnyData(ctx, allAttributes);
};

export const shouldShowBasicDataScreen = (ctx: MachineContext): boolean => {
  const basicCdos = [
    CollectedKybDataOption.name,
    CollectedKybDataOption.tin,
    CollectedKybDataOption.corporationType,
    CollectedKybDataOption.phoneNumber,
    CollectedKybDataOption.website,
  ];
  return isMissingAnyData(ctx, basicCdos) || shouldRecollect(ctx, basicCdos);
};

export const shouldShowAddressDataScreen = (ctx: MachineContext): boolean => {
  const addressCdos = [CollectedKybDataOption.address];
  return isMissingAnyData(ctx, addressCdos) || shouldRecollect(ctx, addressCdos);
};

const isMissingBoProp = (bo: BeneficialOwner) => !bo.first_name || !bo.last_name || !bo.ownership_stake;
const isMissingBoPropWithContact = (bo: BeneficialOwner) => isMissingBoProp(bo) || !bo.phone_number || !bo.email;

export const shouldShowBeneficialOwnersScreen = (ctx: MachineContext): boolean => {
  if (ctx.kybRequirement.hasLinkedBos) return false;
  const data = getBusinessDataFromContext(ctx);
  const boCdos = [CollectedKybDataOption.beneficialOwners, CollectedKybDataOption.kycedBeneficialOwners];

  const missingBoCdos = ctx.kybRequirement.missingAttributes.filter(cdo => boCdos.includes(cdo));
  const requiredDis = missingBoCdos.flatMap(cdo => CollectedKybDataOptionToRequiredAttributes[cdo]);

  const isAnyPropMissing = requiredDis.includes(BusinessDI.kycedBeneficialOwners)
    ? isMissingBoPropWithContact
    : isMissingBoProp;

  const isMissingBos = requiredDis.some(di => {
    const collectedData = data[di];
    return (
      !collectedData ||
      !Array.isArray(collectedData) ||
      collectedData.length === 0 ||
      collectedData.some(isAnyPropMissing)
    );
  });

  return isMissingBos;
};

export const shouldShowManageBosScreen = (ctx: MachineContext): boolean => {
  const boCdos = [CollectedKybDataOption.beneficialOwners, CollectedKybDataOption.kycedBeneficialOwners];
  return shouldRecollect(ctx, boCdos);
};
