import {
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  type BusinessDI,
  type BusinessDIData,
  CdoToAllDisMap,
} from '@onefootprint/types';
import { CollectedKybDataOption, CollectedKybDataOptionToRequiredAttributes } from '@onefootprint/types';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import type { MachineContext } from '../state-machine/types';

type CustomBusinessDI =
  | BusinessDI
  | typeof BootstrapOnlyBusinessSecondaryOwnersKey
  | typeof BootstrapOnlyBusinessSecondaryOwnersKey;

export const extractNonBoBootstrapValues = (filteredObj: MachineContext['bootstrapBusinessData']): BusinessDIData => {
  const ignoreFields = [BootstrapOnlyBusinessSecondaryOwnersKey, BootstrapOnlyBusinessPrimaryOwnerStake];

  return Object.fromEntries(
    Object.entries(filteredObj)
      .filter(([k, v]) => v.value != null && !ignoreFields.includes(k))
      .map(([k, v]) => [k, v.value] as const),
  );
};

export const getBusinessDataFromContext = (ctx: MachineContext): BusinessDIData => {
  const cdos = [...ctx.kybRequirement.populatedAttributes, ...ctx.kybRequirement.missingAttributes];
  const kybDiAttributes = cdos.flatMap(cdo => CdoToAllDisMap[cdo]) as CustomBusinessDI[];

  const filteredBootstrapBusinessData = pickBy(ctx.bootstrapBusinessData, (_, key) =>
    kybDiAttributes.includes(key as CustomBusinessDI),
  );
  const nonBoValues = extractNonBoBootstrapValues(filteredBootstrapBusinessData);

  const initialData = /** This order is important */ {
    ...nonBoValues,
    ...ctx.data,
  };

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

export const shouldShowManageBosScreen = (ctx: MachineContext): boolean => {
  // Since there's some complex logic around saving BOs, let's always show the BOs screen, even if they are bootstrapped.
  // TODO: one day, we can just vault the BOs at the beginning of the flow and rely on the backend logic
  // to tell us if anything is missing.
  // This might be a better general approcah for all bootstrap data - vault it at the beginning of the flow
  // and then re-fetch the requirement to see what's missing
  const boCdos = [CollectedKybDataOption.kycedBeneficialOwners];
  const isMissingBos = ctx.kybRequirement.missingAttributes.some(cdo => boCdos.includes(cdo));
  return isMissingBos || shouldRecollect(ctx, boCdos);
};
