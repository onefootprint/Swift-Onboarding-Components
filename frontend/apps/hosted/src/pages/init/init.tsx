import { useRequestErrorToast } from '@onefootprint/hooks';
import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import { BusinessResponse, ObConfigAuth } from '@onefootprint/types';
import { LoadingIndicator, media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled from 'styled-components';

import useGetBusiness from './hooks/use-get-business';
import useParseUrl from './hooks/use-url-params';

const Init = () => {
  const [state, send] = useHostedMachine();
  const { obConfigAuth } = state.context;
  const showRequestError = useRequestErrorToast();

  useParseUrl({
    onSuccess: (parsedObConfigAuth?: ObConfigAuth, authToken?: string) => {
      send({
        type: 'initContextUpdated',
        payload: {
          authToken,
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
      onError: showRequestError,
    },
  );

  useGetOnboardingConfig(
    { obConfigAuth },
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
      onError: showRequestError,
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
