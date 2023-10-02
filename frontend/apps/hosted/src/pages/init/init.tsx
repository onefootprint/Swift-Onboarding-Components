import { getSessionId, useObserveCollector } from '@onefootprint/dev-tools';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import type { BusinessResponse, ObConfigAuth } from '@onefootprint/types';
import { Shimmer } from '@onefootprint/ui';
import * as LogRocket from 'logrocket';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import useGetBusiness from './hooks/use-get-business';
import useParseUrl from './hooks/use-url-params';

const Init = () => {
  const [state, send] = useHostedMachine();
  const { obConfigAuth, authToken } = state.context;
  const showRequestError = useRequestErrorToast();
  const observeCollector = useObserveCollector();
  const sessionId = getSessionId();

  useParseUrl({
    onSuccess: (
      parsedObConfigAuth?: ObConfigAuth,
      parsedAuthToken?: string,
    ) => {
      send({
        type: 'initContextUpdated',
        payload: {
          authToken: parsedAuthToken,
          obConfigAuth: parsedObConfigAuth,
        },
      });
    },
    onError: (error: string) => {
      console.error(error);
      send({
        type: 'invalidUrlReceived',
      });
    },
  });

  useGetBusiness(
    { obConfigAuth },
    {
      onSuccess: (data: BusinessResponse) => {
        send({
          type: 'initContextUpdated',
          payload: {
            obConfigAuth,
            businessBoKycData: { ...data },
          },
        });
      },
      onError: error => {
        console.error(
          'Hosted app init page fetching business details failed:',
          getErrorMessage(error),
        );
        showRequestError(error);
        send({
          type: 'invalidUrlReceived',
        });
      },
    },
  );

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: onboardingConfig => {
        observeCollector.setAppContext({
          config: onboardingConfig,
        });
        const { orgName, orgId, key } = onboardingConfig;
        LogRocket.identify(sessionId, {
          orgName,
          orgId,
          key,
        });

        send({
          type: 'initContextUpdated',
          payload: {
            obConfigAuth,
            onboardingConfig,
          },
        });
      },
      onError: error => {
        console.error(
          'Hosted app init page fetching onboarding config failed:',
          getErrorMessage(error),
        );
        showRequestError(error);
        send({
          type: 'invalidUrlReceived',
        });
      },
    },
  );

  return (
    <Container>
      <HeaderContainer>
        <Avatar />
        <HeaderTitle>
          <Title />
          <Subtitle />
        </HeaderTitle>
      </HeaderContainer>
      <Button />
    </Container>
  );
};

const Title = () => (
  <Shimmer sx={{ width: '300px', height: '28px', maxWidth: '100%' }} />
);

const Subtitle = () => (
  <Shimmer sx={{ width: '350px', height: '24px', maxWidth: '100%' }} />
);

const Button = () => <Shimmer sx={{ width: '100%', height: '48px' }} />;

const Avatar = () => (
  <Shimmer sx={{ width: '72px', height: '72px', borderRadius: 'full' }} />
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
  `}
`;

const HeaderTitle = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[3]};
    justify-content: center;
    align-items: center;
    margin-top: ${theme.spacing[5]};
  `}
`;

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
    justify-content: center;
    align-items: center;
  `}
`;

export default Init;
