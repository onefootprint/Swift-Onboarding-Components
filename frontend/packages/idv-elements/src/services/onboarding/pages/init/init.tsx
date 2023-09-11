import { useObserveCollector } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';
import { useDeviceInfo } from '../../../../hooks/ui/use-device-info';
import Error from '../../components/error';
import { useOnboardingMachine } from '../../components/machine-provider';
import useOnboarding from './hooks/use-onboarding';

const Init = () => {
  const [state, send] = useOnboardingMachine();
  const { authToken } = state.context;
  const onboardingMutation = useOnboarding();
  const observeCollector = useObserveCollector();

  useDeviceInfo((device: DeviceInfo) => {
    observeCollector.setAppContext({
      device,
    });
    send({
      type: 'initContextUpdated',
      payload: {
        device,
      },
    });
  });

  useEffectOnce(() => {
    if (!authToken || onboardingMutation.isLoading) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess: payload => {
          const { onboardingConfig } = payload;
          send({
            type: 'initContextUpdated',
            payload: {
              ...payload,
              config: {
                ...onboardingConfig,
              },
            },
          });
        },
        onError: (error: unknown) => {
          console.error(
            'Error while initiating onboarding in onboarding init page',
            getErrorMessage(error),
          );
          send({
            type: 'configRequestFailed',
          });
        },
      },
    );
  });

  if (!authToken || onboardingMutation.isError) {
    return <Error />;
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    min-height: var(--loading-container-min-height);
    justify-content: center;
    text-align: center;
  `}
`;

export default Init;
