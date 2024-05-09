import type { Document, SupportedIdDocTypes } from '@onefootprint/types';

const filterDocumentsByKind = (
  documents?: Document[],
  documentType?: SupportedIdDocTypes,
) => (documents || []).filter(document => document.kind === documentType);

export default filterDocumentsByKind;
