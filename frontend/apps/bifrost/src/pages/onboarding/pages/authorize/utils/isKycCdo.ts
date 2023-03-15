import {
  CollectedDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';

const isKycCdo = (cdo: CollectedDataOption) =>
  Object.values(CollectedKycDataOption).includes(cdo as CollectedKycDataOption);

export default isKycCdo;
