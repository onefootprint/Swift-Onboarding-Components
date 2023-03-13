import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';

type ErrorProps = {
  resetErrorBoundary: () => void;
};

const Error = ({ resetErrorBoundary }: ErrorProps) => {
  const { t } = useTranslation('error');

  return (
    <EmptyState
      description={t('description')}
      iconComponent={IcoForbid40}
      title={t('title')}
      cta={{
        label: t('cta'),
        onClick: resetErrorBoundary,
      }}
    />
  );
};

export default Error;
