import { getErrorMessage } from '@onefootprint/request';
import {
  SkipLivenessClientType,
  SkipLivenessReason,
} from '@onefootprint/types/src/api/skip-liveness';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../components';
import { useSkipLiveness } from '../../../../hooks';
import checkIsIframe from '../../../../utils/check-is-in-iframe';
import Logger from '../../../../utils/logger';
import useLivenessMachine from '../../hooks/use-liveness-machine';

const Unavailable = () => {
  const [state, send] = useLivenessMachine();
  const { authToken, device } = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    if (!authToken) {
      return;
    }

    let reason;
    if (checkIsIframe()) {
      reason = SkipLivenessReason.unavailableInIframe;
    } else if (!device?.hasSupportForWebauthn) {
      reason = SkipLivenessReason.unavailableOnDevice;
    } else {
      reason = SkipLivenessReason.unknown;
    }

    const context = {
      reason,
      clientType: SkipLivenessClientType.web,
      numAttempts: 0,
      attempts: [],
    };
    skipLivenessMutation.mutate(
      { authToken, context },
      {
        onSuccess: () => {
          send({
            type: 'completed',
          });
        },
        onError: (error: unknown) => {
          Logger.error(
            `Error while skipping liveness in liveness unavailable page: ${getErrorMessage(
              error,
            )}`,
            'liveness-unavailable',
          );
        },
      },
    );
  });

  return (
    <Container>
      <NavigationHeader />
      <AnimatedLoadingSpinner animationStart />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  min-height: var(--loading-container-min-height);
`;

export default Unavailable;
