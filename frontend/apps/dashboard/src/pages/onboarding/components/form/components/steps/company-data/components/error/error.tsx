import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  error: unknown;
};

const Error = ({ error }: ErrorProps) => {
  const { t } = useTranslation('notifications');

  return (
    <EmptyState
      description={getErrorMessage(error)}
      iconComponent={IcoForbid40}
      title={t('error')}
    />
  );
};

export default Error;
