import { IcoForbid40 } from '@onefootprint/icons';
import { EmptyState } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { NavigationHeader } from '../../../layout';

type ErrorProps = {
  resetErrorBoundary: () => void;
};

const ErrorComponent = ({ resetErrorBoundary }: ErrorProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.errors.uncaught-error',
  });

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

export default ErrorComponent;
