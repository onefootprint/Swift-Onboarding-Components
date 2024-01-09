import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeader } from '../../../layout';

type ErrorProps = {
  resetErrorBoundary: () => void;
};

const Error = ({ resetErrorBoundary }: ErrorProps) => {
  const { t } = useTranslation('global.errors.uncaught-error');

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <EmptyState
        description={t('description')}
        iconComponent={IcoForbid40}
        title={t('title')}
        cta={{
          label: t('cta'),
          onClick: resetErrorBoundary,
        }}
      />
    </>
  );
};

export default Error;
