import { Document, SupportedIdDocTypes } from '@onefootprint/types';

const filterDocumentsByKind = (
  documents: Document[],
  documentKind?: SupportedIdDocTypes,
) => {
  if (documents.length === 0 || !documentKind) {
    return [];
  }
  return documents.filter(document => document.kind === documentKind);
};

export default filterDocumentsByKind;
