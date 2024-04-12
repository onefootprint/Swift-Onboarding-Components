import type {
  DocumentDI,
  EntityVault,
  SupportedIdDocTypes,
} from '@onefootprint/types';

// Get all of the keys in the vault that are (a) associated with the current DocumentType and
// (b) not an image or latest upload (we show these separately).

type GetRelevantKeysProps = {
  vault: EntityVault;
  documentType: SupportedIdDocTypes;
};

const getRelevantKeys = ({ vault, documentType }: GetRelevantKeysProps) =>
  Object.keys(vault).filter(
    key =>
      key.includes(documentType as string) &&
      !key.includes('image') &&
      !key.includes('latest_upload') &&
      !key.includes('classified_document_type') &&
      !key.includes('curp_validation_response'),
  ) as DocumentDI[];

export default getRelevantKeys;
