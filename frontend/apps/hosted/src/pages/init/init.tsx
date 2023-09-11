import { useRequestErrorToast } from '@onefootprint/hooks';
import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import type { BusinessResponse, ObConfigAuth } from '@onefootprint/types';
import { LoadingIndicator, media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import useGetBusiness from './hooks/use-get-business';
import useParseUrl from './hooks/use-url-params';

const Init = () => {
  const [state, send] = useHostedMachine();
  const { obConfigAuth, authToken } = state.context;
  const showRequestError = useRequestErrorToast();

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
    onError: () => {
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

  ${media.greaterThan('md')`
    min-width: var(--loading-container-min-width);
  `}
`;

export default Init;
