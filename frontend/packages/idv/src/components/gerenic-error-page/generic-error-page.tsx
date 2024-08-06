import { EmptyState } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { NavigationHeader } from '../layout';

type GenericErrorPageProps = {
  onRetry: () => void;
  retryLimitExceeded?: boolean;
};

const GenericErrorPage = ({ onRetry, retryLimitExceeded }: GenericErrorPageProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.generic-error',
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <EmptyState
        description={t('description')}
        title={t('title')}
        cta={
          retryLimitExceeded
            ? undefined
            : {
                label: t('cta'),
                onClick: onRetry,
              }
        }
      />
    </>
  );
};

export default GenericErrorPage;
