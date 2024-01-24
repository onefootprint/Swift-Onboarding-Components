import { Badge, Typography } from '@onefootprint/ui';
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
      <Typography
        variant="caption-1"
        color={status}
        sx={{ whiteSpace: 'nowrap' }}
      >
        {t(status)}
      </Typography>
    </Badge>
  ) : null;
};

export default DocumentStatusBadge;
