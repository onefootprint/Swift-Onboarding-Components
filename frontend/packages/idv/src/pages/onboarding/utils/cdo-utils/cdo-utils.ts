import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

export const isDocCdo = (data: CollectedDataOption) =>
  Object.values(CollectedDocumentDataOption).includes(data as CollectedDocumentDataOption);

export const isInvestorProfileCdo = (data: CollectedDataOption) =>
  Object.values(CollectedInvestorProfileDataOption).includes(data as CollectedInvestorProfileDataOption);

export const isKybCdo = (data: CollectedDataOption) =>
  Object.values(CollectedKybDataOption).includes(data as CollectedKybDataOption);

export const isKycCdo = (cdo: CollectedDataOption) =>
  Object.values(CollectedKycDataOption).includes(cdo as CollectedKycDataOption);
