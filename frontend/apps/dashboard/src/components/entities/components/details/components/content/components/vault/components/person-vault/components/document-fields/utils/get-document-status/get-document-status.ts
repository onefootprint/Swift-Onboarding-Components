import type { Document, SupportedIdDocTypes } from '@onefootprint/types';
import { IdDocStatus } from '@onefootprint/types';

import type { DocumentStatus } from '../../components/document-status-badge';
import filterDocumentsByKind from '../filter-documents-by-kind';

type GetDocumentStatusProps = {
  documents?: Document[];
  documentType?: SupportedIdDocTypes;
};

const DocStatusToUIState: Record<IdDocStatus, DocumentStatus> = {
  [IdDocStatus.complete]: 'success',
  [IdDocStatus.pending]: 'warning',
  [IdDocStatus.failed]: 'error',
};

const getDocumentStatus = ({
  documents,
  documentType,
}: GetDocumentStatusProps) => {
  if (!documents || !documentType) {
    return undefined;
  }
  const relevantDocuments = filterDocumentsByKind(documents, documentType);
  const mostRecentDocument = relevantDocuments.sort((a, b) => {
    if (!a.startedAt || !b.startedAt) return 0;
    return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime();
  })[0];
  return (
    mostRecentDocument.status && DocStatusToUIState[mostRecentDocument.status]
  );
};

export default getDocumentStatus;
