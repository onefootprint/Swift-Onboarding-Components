import { useRequestErrorToast } from '@onefootprint/hooks';
import { Logger, getLogger, useGetOnboardingConfig } from '@onefootprint/idv';
import { getErrorMessage, useRequestError } from '@onefootprint/request';
import type { BusinessResponse } from '@onefootprint/types';
import { Shimmer, media } from '@onefootprint/ui';
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
  const { getErrorCode } = useRequestError();

  useParseUrl({
    onSuccess: ({ obConfigAuth: parsedObConfigAuth, authToken: parsedAuthToken, urlType }) => {
      send({
        type: 'initContextUpdated',
        payload: {
          authToken: parsedAuthToken,
          obConfigAuth: parsedObConfigAuth,
          urlType,
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
        const errorCode = getErrorCode(err);
        if (errorCode === 'E118') {
          send({ type: 'expired' });
        } else {
          send({ type: 'invalidUrlReceived' });
        }
      },
    },
  );

  useGetOnboardingConfig(
    { obConfigAuth, authToken },
    {
      onSuccess: onboardingConfig => {
        if (onboardingConfig.isLive && !orgIds.has(onboardingConfig.orgId)) {
          Logger.startSessionReplay();
          Logger.identify({
            appClipExperienceId: onboardingConfig.appClipExperienceId,
            isAppClipEnabled: onboardingConfig.isAppClipEnabled,
            isInstantAppEnabled: onboardingConfig.isInstantAppEnabled,
            kind: String(onboardingConfig.kind),
            orgId: onboardingConfig.orgId,
            orgName: onboardingConfig.orgName,
            publicKey: onboardingConfig.key,
          });
        }

        send({
          type: 'initContextUpdated',
          payload: { obConfigAuth, onboardingConfig },
        });
      },
      onError: err => {
        logError(`Fetching onboarding config: ${getErrorMessage(err)}`, err);
        showRequestError(err);
        const errorCode = getErrorCode(err);
        if (errorCode === 'E118') {
          send({ type: 'expired' });
        } else {
          send({ type: 'invalidUrlReceived' });
        }
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

const Title = () => <Shimmer height="28px" width="300px" maxWidth="100%" />;

const Subtitle = () => <Shimmer height="24px" width="350px" maxWidth="100%" />;

const Button = () => <Shimmer height="48px" width="100%" />;

const Avatar = () => <Shimmer height="72px" width="72px" borderRadius="full" />;

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
