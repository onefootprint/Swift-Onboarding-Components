import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import { useSkipLiveness } from '../../../../hooks';
import useLivenessMachine, { Events } from '../../hooks/use-liveness-machine';

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
            type: Events.completed,
          });
        },
      },
    );
  });

  return (
    <Container>
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
