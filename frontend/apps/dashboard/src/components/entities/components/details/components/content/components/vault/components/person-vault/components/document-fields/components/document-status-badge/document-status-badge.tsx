import type { UIStates } from '@onefootprint/design-tokens';
import type { Document, SupportedIdDocTypes } from '@onefootprint/types';
import { Badge, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getDocumentStatus } from '../../utils';
import { DocumentStatus } from '../../utils/get-document-status/get-document-status';

type DocumentBadgeStatusProps = {
  documents?: Document[];
  documentType?: SupportedIdDocTypes;
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

const DocumentStatusBadge = ({ documents, documentType }: DocumentBadgeStatusProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.decrypt.status',
  });
  const status = getDocumentStatus({ documents, documentType });

  return status ? (
    <Badge variant={DocStatusToUIState[status]}>
      <Text variant="caption-1" color={DocStatusToUIState[status]} whiteSpace="nowrap">
        {t(status)}
      </Text>
    </Badge>
  ) : null;
};

export default DocumentStatusBadge;
