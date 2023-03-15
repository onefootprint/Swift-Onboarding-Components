import {
  CollectedDataOption,
  CollectedKybDataOption,
} from '@onefootprint/types';

const isKybCdo = (data: CollectedDataOption) =>
  Object.values(CollectedKybDataOption).includes(
    data as CollectedKybDataOption,
  );

export default isKybCdo;
