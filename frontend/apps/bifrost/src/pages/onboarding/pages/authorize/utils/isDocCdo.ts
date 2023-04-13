import {
  CollectedDataOption,
  CollectedDocumentDataOption,
} from '@onefootprint/types';

const isDocCdo = (data: CollectedDataOption) =>
  Object.values(CollectedDocumentDataOption).includes(
    data as CollectedDocumentDataOption,
  );

export default isDocCdo;
