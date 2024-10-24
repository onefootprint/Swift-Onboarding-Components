import type { UIStates } from '@onefootprint/design-tokens';
import type { Document } from '@onefootprint/types';
import { Badge, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import getDocumentStatus, { DocumentStatus } from '../../utils/get-document-status';

type DocumentStatusBadgeProps = {
  document: Omit<Document, 'uploads'>;
};

const DocStatusToUIState: Record<DocumentStatus, keyof UIStates> = {
  [DocumentStatus.UploadedViaApi]: 'neutral',
  [DocumentStatus.UploadFailed]: 'error',
  [DocumentStatus.UploadIncomplete]: 'warning',
  [DocumentStatus.PendingMachineReview]: 'warning',
  [DocumentStatus.ReviewedByMachine]: 'neutral',
  [DocumentStatus.PendingHumanReview]: 'error',
  [DocumentStatus.ReviewedByHuman]: 'neutral',
};

const DocumentStatusBadge = ({ document }: DocumentStatusBadgeProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'fieldset.documents.status',
  });
  const status = getDocumentStatus(document);

  return status ? (
    <Badge variant={DocStatusToUIState[status]}>
      <Text variant="caption-1" color={DocStatusToUIState[status]} whiteSpace="nowrap">
        {t(status)}
      </Text>
    </Badge>
  ) : null;
};

export default DocumentStatusBadge;
