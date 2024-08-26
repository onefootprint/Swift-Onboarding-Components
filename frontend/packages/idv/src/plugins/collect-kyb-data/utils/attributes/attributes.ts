import {
  BootstrapOnlyBusinessOwnersKey,
  BusinessDI,
  type BusinessDIData,
  CdoToAllDisMap,
  type DecryptUserResponse,
} from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import type { BootstrapBusinessData } from '../../../../types';
import { isStringValid } from '../../../../utils';
import { BeneficialOwnerIdFields } from '../constants';
import type { MachineContext } from '../state-machine/types';
import { buildBeneficialOwner, getBoDi } from '../utils';

type CustomBusinessDI = BusinessDI | typeof BootstrapOnlyBusinessOwnersKey;
type BusinessOwners = BootstrapBusinessData[typeof BootstrapOnlyBusinessOwnersKey];

export const BO_FIELDS: BusinessDI[] = [BusinessDI.beneficialOwners, BusinessDI.kycedBeneficialOwners];

export const extractNonBoBootstrapValues = (filteredObj: MachineContext['bootstrapBusinessData']): BusinessDIData => {
  const extendedBoFields = [...BO_FIELDS, BootstrapOnlyBusinessOwnersKey];

  return Object.fromEntries(
    Object.entries(filteredObj)
      .filter(([k, v]) => v.value != null && !extendedBoFields.includes(k))
      .map(([k, v]) => [k, v.value] as const),
  );
};

export const extractBoBootstrapValues = (ctx: MachineContext): BusinessDIData => {
  const cdos = [...(ctx.kybRequirement.populatedAttributes || []), ...ctx.kybRequirement.missingAttributes];
  const boDi = getBoDi(cdos);
  const businessOwnersObj: BusinessOwners = ctx.bootstrapBusinessData[BootstrapOnlyBusinessOwnersKey];

  if (!boDi) return {};

  const fromKybBootstrap = {
    [boDi]: businessOwnersObj?.value.map(owner => {
      return Object.fromEntries(
        Object.entries(owner)
          .map(([key, value]) => {
            if (key === 'firstName') return ['first_name', value] as const;
            if (key === 'lastName') return ['last_name', value] as const;
            if (key === 'ownershipStake') return ['ownership_stake', value] as const;

            if (boDi === BusinessDI.kycedBeneficialOwners) {
              if (key === 'email') return ['email', value] as const;
              if (key === 'phoneNumber') return ['phone_number', value] as const;
            }

            return [undefined, undefined];
          })
          .filter(([_k, v]) => v != null),
      );
    }),
  };

  if (fromKybBootstrap?.[boDi] != null) return fromKybBootstrap;

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
  const cdos = [...(ctx.kybRequirement.populatedAttributes || []), ...ctx.kybRequirement.missingAttributes];
  const kybDiAttributes = cdos.flatMap(cdo => CdoToAllDisMap[cdo]) as CustomBusinessDI[];

  const filteredBootstrapBusinessData = pickBy(ctx.bootstrapBusinessData, (_, key) => {
    const kybDiAttributesWithCustomBootstrap = kybDiAttributes.concat(BootstrapOnlyBusinessOwnersKey);
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

  return omit(initialData, [BootstrapOnlyBusinessOwnersKey]);
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
