import { EmptyState } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { NavigationHeader } from '../layout';

type SessionExpiredProps = {
  onRestart: () => void;
  retryLimitExceeded?: boolean;
};

const SessionExpired = ({ onRestart, retryLimitExceeded }: SessionExpiredProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.session-expired',
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
                onClick: onRestart,
              }
        }
        testID="restart-button"
      />
    </>
  );
};

export default SessionExpired;
