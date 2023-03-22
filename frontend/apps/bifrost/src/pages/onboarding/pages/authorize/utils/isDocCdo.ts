import {
  CollectedDataOption,
  CollectedIdDocumentDataOption,
} from '@onefootprint/types';

const isDocCdo = (data: CollectedDataOption) =>
  Object.values(CollectedIdDocumentDataOption).includes(
    data as CollectedIdDocumentDataOption,
  );

export default isDocCdo;
