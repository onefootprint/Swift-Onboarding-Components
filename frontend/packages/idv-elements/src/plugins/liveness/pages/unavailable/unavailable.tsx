import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../components';
import { useSkipLiveness } from '../../../../hooks';
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
          console.error(
            'Error while skipping liveness in liveness unavailable page.',
            getErrorMessage(error),
          );
        },
      },
    );
  });

  return (
    <Container>
      <NavigationHeader />
      <LoadingIndicator />
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
