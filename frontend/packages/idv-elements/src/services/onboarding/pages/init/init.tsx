import { useObserveCollector } from '@onefootprint/dev-tools';
import { DeviceInfo, useDeviceInfo, useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import {
  CollectedDataOptionLabels,
  OnboardingConfig,
} from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import useGetOnboardingConfig from '../../../../hooks/api/org/get-onboarding-config';
import { useOnboardingMachine } from '../../components/machine-provider';
import useOnboarding from './hooks/use-onboarding';

const Init = () => {
  const { t } = useTranslation('pages.init');
  const [state, send] = useOnboardingMachine();
  const { authToken, obConfigAuth } = state.context;
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

  useGetOnboardingConfig(
    { obConfigAuth },
    {
      onSuccess: (config: OnboardingConfig) => {
        observeCollector.setAppContext({
          config,
        });
        send({
          type: 'initContextUpdated',
          payload: {
            config: {
              ...config,
              mustCollectData: config.mustCollectData.map(
                (attr: string) => CollectedDataOptionLabels[attr],
              ),
              canAccessData: config.canAccessData.map(
                (attr: string) => CollectedDataOptionLabels[attr],
              ),
            },
          },
        });
      },
      onError: () => {
        send({
          type: 'configRequestFailed',
        });
      },
    },
  );

  useEffectOnce(() => {
    if (!authToken || onboardingMutation.isLoading) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess: payload => {
          send({
            type: 'initContextUpdated',
            payload,
          });
        },
      },
    );
  });

  if (!authToken || onboardingMutation.isError) {
    return (
      <Container>
        <TitleContainer>
          <IcoForbid40 color="error" />
          <Typography variant="heading-3">{t('error.title')}</Typography>
        </TitleContainer>
        <Typography variant="body-2">{t('error.description')}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

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
