import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useSkipLiveness } from '../../../../hooks';
import HeaderTitle from '../../components/header-title';
import useLivenessMachine, {
  Events,
  MachineContext,
} from '../../hooks/use-liveness-machine';

const TRANSITION_DELAY = 6000;

const Unavailable = () => {
  const { t } = useTranslation('pages.unavailable');
  const [state, send] = useLivenessMachine();
  const { authToken, tenant }: MachineContext = state.context;
  const skipLivenessMutation = useSkipLiveness();
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
