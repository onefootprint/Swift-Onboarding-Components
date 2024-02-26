import { getErrorMessage } from '@onefootprint/request';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../components';
import { useSkipLiveness } from '../../../../hooks';
import Logger from '../../../../utils/logger';
import useLivenessMachine from '../../hooks/use-liveness-machine';

const Unavailable = () => {
  const [state, send] = useLivenessMachine();
  const { authToken } = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    if (!authToken) {
      return;
    }

    skipLivenessMutation.mutate(
      { authToken },
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
