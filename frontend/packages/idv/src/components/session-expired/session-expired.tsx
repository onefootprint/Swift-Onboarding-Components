import { EmptyState } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { NavigationHeader } from '../layout';

type SessionExpiredProps = {
  onRestart: () => void;
};

const SessionExpired = ({ onRestart }: SessionExpiredProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.session-expired',
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <EmptyState
        description={t('description')}
        title={t('title')}
        cta={{
          label: t('cta'),
          onClick: onRestart,
        }}
        testID="restart-button"
      />
    </>
  );
};

export default SessionExpired;
