import {
  Document,
  IdDocStatus,
  SupportedIdDocTypes,
} from '@onefootprint/types';

import { DocumentStatus } from '../../components/document-status-badge';
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
  return DocStatusToUIState[IdDocStatus.failed];
};

export default getDocumentStatus;
