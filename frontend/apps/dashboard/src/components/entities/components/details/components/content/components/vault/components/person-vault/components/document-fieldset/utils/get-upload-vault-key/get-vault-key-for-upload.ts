import { type DataIdentifier, SupportedIdDocTypes } from '@onefootprint/types';
import type { UploadWithDocument } from '../../types';

// Returns the DataIdentifier under which the upload is stored in vault
const getVaultKeyForUpload = ({ document, identifier, version }: UploadWithDocument): DataIdentifier => {
  return document.kind === SupportedIdDocTypes.custom ? identifier : (`${identifier}:${version}` as DataIdentifier);
};

export default getVaultKeyForUpload;
