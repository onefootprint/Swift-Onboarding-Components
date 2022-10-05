import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  message: string;
};

const Error = ({ message }: ErrorProps) => {
  const { t } = useTranslation('notifications');
  return (
    <EmptyState
      description={message}
      renderImage={() => <IcoForbid40 />}
      title={t('error')}
    />
  );
};

export default Error;
