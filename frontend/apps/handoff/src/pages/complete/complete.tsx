import { useCountdown, useTranslation } from '@onefootprint/hooks';
import { D2PStatusUpdate } from '@onefootprint/types';
import { useUpdateD2PStatus } from 'footprint-elements';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import HeaderTitle from '../../components/header-title';
import useHandoffMachine from '../../hooks/use-handoff-machine';
import useOpener from '../../hooks/use-opener';

const SUCCESS_COUNTER_SECONDS = 3;

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const opener = useOpener();
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const [state] = useHandoffMachine();
  const { authToken } = state.context;

  const shouldShowCounter = opener === 'mobile';
  const { countdown, setSeconds } = useCountdown({
    disabled: !shouldShowCounter,
    onCompleted: () => window.close(),
  });

  useEffectOnce(() => {
    if (authToken) {
      updateD2PStatusMutation.mutate({
        authToken,
        status: D2PStatusUpdate.completed,
      });
    }
    setSeconds(SUCCESS_COUNTER_SECONDS);
  });

  return (
    <HeaderTitle
      title={t('title')}
      subtitle={
        shouldShowCounter
          ? t('subtitle.with-countdown', { seconds: countdown })
          : t('subtitle.without-countdown')
      }
    />
  );
};

export default Complete;
