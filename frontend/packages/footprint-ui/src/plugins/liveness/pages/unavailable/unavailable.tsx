import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../components/header-title';
import { useLivenessMachine } from '../../components/machine-provider';
import useSkipLivenessMutation from '../../hooks/use-skip-liveness';
import { Events } from '../../utils/state-machine/types';

const TRANSITION_DELAY = 6000;

const Unavailable = () => {
  const { t } = useTranslation('pages.unavailable');
  const [state, send] = useLivenessMachine();
  const { authToken, tenant } = state.context;
  const skipLivenessMutation = useSkipLivenessMutation();
  const handleLivenessSkipped = () => {
    setTimeout(() => {
      send({
        type: Events.completed,
      });
    }, TRANSITION_DELAY);
  };

  useEffectOnce(() => {
    if (authToken && tenant?.pk) {
      skipLivenessMutation.mutate(
        { authToken, tenantPk: tenant.pk },
        { onSuccess: handleLivenessSkipped },
      );
    }
  });

  return <HeaderTitle title={t('title')} subtitle={t('subtitle')} />;
};

export default Unavailable;
