import { useTranslation } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import React, { useEffect } from 'react';

import HeaderTitle from '../../components/header-title';
import useHandoffMachine from '../../hooks/use-handoff-machine';
import useSkipLivenessMutation from '../../hooks/use-skip-liveness';
import useUpdateD2pStatus from '../../hooks/use-update-d2p-status';

const Unavailable = () => {
  const { t } = useTranslation('pages.unavailable');
  const [state] = useHandoffMachine();
  const { authToken, tenantPk } = state.context;
  const skipLivenessMutation = useSkipLivenessMutation();
  const updateD2PStatusMutation = useUpdateD2pStatus();
  useEffect(() => {
    if (tenantPk) {
      skipLivenessMutation.mutate({ authToken, tenantPk });
    }
    updateD2PStatusMutation.mutate({
      authToken: state.context.authToken,
      status: D2PStatusUpdate.failed,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <HeaderTitle title={t('title')} subtitle={t('subtitle')} />;
};

export default Unavailable;
