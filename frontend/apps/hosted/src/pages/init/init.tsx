import { useRequestErrorToast } from '@onefootprint/hooks';
import { getLogger, Logger, useGetOnboardingConfig } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { BusinessResponse, ObConfigAuth } from '@onefootprint/types';
import { media, Shimmer } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import useGetBusiness from './hooks/use-get-business';
import useParseUrl from './hooks/use-url-params';

const { logError } = getLogger({ location: 'hosted-init' });

const Init = () => {
  const [state, send] = useHostedMachine();
  const { obConfigAuth, authToken } = state.context;
  const showRequestError = useRequestErrorToast();
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);

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
    onError: (err: string) => {
      logError('Error parsing URL', err);
      send({ type: 'invalidUrlReceived' });
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
      onError: err => {
        logError(`Fetching business details: ${getErrorMessage(err)}`, err);
        showRequestError(err);
        send({ type: 'invalidUrlReceived' });
      },
    },
  );

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: onboardingConfig => {
        const { orgName, orgId, key, isLive } = onboardingConfig;
        if (isLive && !orgIds.has(orgId)) {
          Logger.enableLogRocket();
          Logger.identify({ orgName, orgId, publicKey: key });
        }

        send({
          type: 'initContextUpdated',
          payload: { obConfigAuth, onboardingConfig },
        });
      },
      onError: err => {
        logError(`Fetching onboarding config: ${getErrorMessage(err)}`, err);
        showRequestError(err);
        send({ type: 'invalidUrlReceived' });
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

    ${media.greaterThan('md')`
      padding-top: ${theme.spacing[7]}; 
    `}
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
