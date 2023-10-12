import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { NavigationHeader } from '../../../../../components';
import { useSkipLiveness } from '../../../../../hooks';
import Logger from '../../../../../utils/logger';
import useMobileMachine from '../../../hooks/mobile/use-mobile-machine';

const SkipLiveness = () => {
  const [state, send] = useMobileMachine();
  const { authToken, device } = state.context;
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    skipLivenessMutation.mutate(
      { authToken },
      {
        onSuccess: () => {
          send({
            type: 'livenessSkipped',
          });
        },
        onError: (error: unknown) => {
          console.error(
            `Error while skipping liveness on transfer plugin running on mobile. Webauthn availability: ${
              device.hasSupportForWebauthn ? 'available' : 'none'
            }`,
            getErrorMessage(error),
          );
          Logger.error(
            `Error while skipping liveness on transfer plugin running on mobile. Webauthn availability: ${
              device.hasSupportForWebauthn ? 'available' : 'none'
            }`,
            'transfer-skip-liveness',
          );
        },
      },
    );
  });

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Container>
        <LoadingIndicator />
      </Container>
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
`;

export default SkipLiveness;
