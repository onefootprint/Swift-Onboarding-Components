import type { Document, SupportedIdDocTypes } from '@onefootprint/types';

const filterDocumentsByKind = (
  documents?: Document[],
  documentType?: SupportedIdDocTypes,
) => {
  if (!documents || documents.length === 0 || !documentType) {
    return [];
  }
  return documents.filter(document => document.kind === documentType);
};

export default filterDocumentsByKind;
