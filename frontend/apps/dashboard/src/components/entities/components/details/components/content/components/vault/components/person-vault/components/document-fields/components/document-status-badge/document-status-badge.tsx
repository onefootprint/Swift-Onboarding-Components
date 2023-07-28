import { useTranslation } from '@onefootprint/hooks';
import { Badge, Typography } from '@onefootprint/ui';
import React from 'react';

export type DocumentStatus = 'success' | 'warning' | 'error';

type DocumentBadgeStatusProps = {
  status: DocumentStatus;
};

const DocumentStatusBadge = ({ status }: DocumentBadgeStatusProps) => {
  const { t } = useTranslation('pages.entity.decrypt.status');

  return (
    <Badge variant={status}>
      <Typography variant="caption-1" color={status}>
        {t(status)}
      </Typography>
    </Badge>
  );
};

export default DocumentStatusBadge;
