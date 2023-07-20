import {
  DocumentDI,
  EntityVault,
  SupportedIdDocTypes,
} from '@onefootprint/types';

// Get all of the keys in the vault that are (a) associated with the current DocumentKind and
// (b) not an image or latest upload (we show these separately).
const getRelevantKeys = (
  vault: EntityVault,
  documentKind: SupportedIdDocTypes,
) =>
  Object.keys(vault).filter(
    key =>
      key.includes(documentKind as string) &&
      !key.includes('image') &&
      !key.includes('latest_upload'),
  ) as DocumentDI[];

export default getRelevantKeys;
