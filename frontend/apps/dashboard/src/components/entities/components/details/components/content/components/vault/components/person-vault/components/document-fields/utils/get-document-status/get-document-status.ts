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
  if (
    relevantDocuments.some(document => document.status === IdDocStatus.complete)
  ) {
    return DocStatusToUIState[IdDocStatus.complete];
  }
  if (
    relevantDocuments.some(document => document.status === IdDocStatus.pending)
  ) {
    return DocStatusToUIState[IdDocStatus.pending];
  }
  if (
    relevantDocuments.some(document => document.status === IdDocStatus.failed)
  ) {
    return DocStatusToUIState[IdDocStatus.failed];
  }
  return undefined;
};

export default getDocumentStatus;
