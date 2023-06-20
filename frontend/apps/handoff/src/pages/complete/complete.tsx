import { useCountdown, useTranslation } from '@onefootprint/hooks';
import {
  HeaderTitle,
  NavigationHeader,
  useUpdateD2PStatus,
} from '@onefootprint/idv-elements';
import { D2PStatusUpdate } from '@onefootprint/types';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const SUCCESS_COUNTER_SECONDS = 3;

const Complete = () => {
  const { t } = useTranslation('pages.complete');
  const updateD2PStatusMutation = useUpdateD2PStatus();
  const [state] = useHandoffMachine();
  const { authToken, opener } = state.context;

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
    <>
      <NavigationHeader />
      <Aligner>
        <HeaderTitle
          title={t('title')}
          subtitle={
            shouldShowCounter
              ? t('subtitle.with-countdown', { seconds: countdown })
              : t('subtitle.without-countdown')
          }
        />
      </Aligner>
    </>
  );
};

const Aligner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 64px);
`;

export default Complete;
