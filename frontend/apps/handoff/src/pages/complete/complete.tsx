import { useCountdown } from '@onefootprint/hooks';
import {
  HeaderTitle,
  NavigationHeader,
  useUpdateD2PStatus,
} from '@onefootprint/idv';
import { D2PStatusUpdate } from '@onefootprint/types';
import { Box } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useHandoffMachine from '../../hooks/use-handoff-machine';

const SUCCESS_COUNTER_SECONDS = 3;

const Complete = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.complete' });
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
    <Container>
      <Box>
        <NavigationHeader />
        <HeaderTitle
          title={t('title')}
          subtitle={
            shouldShowCounter
              ? t('subtitle.with-countdown', { seconds: countdown })
              : t('subtitle.without-countdown')
          }
        />
      </Box>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  text-align: center;
`;

export default Complete;
