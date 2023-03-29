import { useTranslation } from '@onefootprint/hooks';
import { OnboardingConfig } from '@onefootprint/types';
import { Badge, Typography } from '@onefootprint/ui';
import React from 'react';

type StatusRowProps = {
  data: OnboardingConfig;
};

const StatusRow = ({ data }: StatusRowProps) => {
  const { status } = data;
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.list-item.status',
  );

  return (
    <tr>
      <td>
        <Typography color="tertiary" variant="body-3">
          {t('label')}
        </Typography>
      </td>
      <td>
        <Badge variant={status === 'enabled' ? 'success' : 'error'}>
          {status}
        </Badge>
      </td>
      <td />
    </tr>
  );
};

export default StatusRow;
