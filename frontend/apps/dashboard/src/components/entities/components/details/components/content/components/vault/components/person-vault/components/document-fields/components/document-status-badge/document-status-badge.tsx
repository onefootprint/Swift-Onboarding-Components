import { Badge, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export type DocumentStatus = 'success' | 'warning' | 'error';

type DocumentBadgeStatusProps = {
  status?: DocumentStatus;
};

const DocumentStatusBadge = ({ status }: DocumentBadgeStatusProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.decrypt.status',
  });

  return status ? (
    <Badge variant={status}>
      <Text variant="caption-1" color={status} whiteSpace="nowrap">
        {t(status)}
      </Text>
    </Badge>
  ) : null;
};

export default DocumentStatusBadge;
