import { useRequestErrorToast } from '@onefootprint/hooks';
import { Logger, getLogger, trackAction, useBusiness, useGetOnboardingConfig } from '@onefootprint/idv';
import { getErrorMessage, useRequestError } from '@onefootprint/request';
import { Shimmer, Stack, media } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

import type { PublicOnboardingConfig } from '@onefootprint/types';
import { useEffect } from 'react';
import useParseUrl from './hooks/use-url-params';

const { logError, logInfo } = getLogger({ location: 'hosted-init' });

const setupLogger = (config: PublicOnboardingConfig) => {
  Logger.startSessionReplay();
  Logger.setGlobalContext({
    appClipExperienceId: config.appClipExperienceId,
    isAppClipEnabled: config.isAppClipEnabled,
    isInstantAppEnabled: config.isInstantAppEnabled,
    isNoPhoneFlow: config.isNoPhoneFlow,
    isStepupEnabled: Boolean(config.isStepupEnabled),
    kind: String(config.kind),
    orgId: config.orgId,
    orgName: config.orgName,
    publicKey: config.key,
    requiresIdDoc: config.requiresIdDoc,
  });
};

const Init = () => {
  const [state, send] = useHostedMachine();
  const { obConfigAuth, authToken } = state.context;
  const showRequestError = useRequestErrorToast();
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);
  const { getErrorCode } = useRequestError();

  const queryGetBusiness = useBusiness({ obConfigAuth });
  const isGetBusinessLoading = queryGetBusiness.isFetching && queryGetBusiness.isPending;
  const businessBoKycData = queryGetBusiness.data;

  const queryGetOnboardingConfig = useGetOnboardingConfig({ obConfigAuth, authToken });
  const isGetOnboardingConfigLoading = queryGetOnboardingConfig.isFetching && queryGetOnboardingConfig.isPending;
  const onboardingConfig = queryGetOnboardingConfig.data;

  useParseUrl({
    onSuccess: ({ obConfigAuth: parsedObConfigAuth, authToken: parsedAuthToken, urlType }) => {
      logInfo(`URL parsed with type: ${urlType}`);
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

  useEffect(() => {
    if (isGetBusinessLoading || isGetOnboardingConfigLoading) return;

    const businessError = queryGetBusiness.error;
    const configError = queryGetOnboardingConfig.error;
    const error = businessError || configError;
    if (error) {
      if (businessError) {
        logError(`Fetching business details: ${getErrorMessage(businessError)}`, businessError);
      }
      if (configError) {
        logError(`Fetching onboarding config: ${getErrorMessage(configError)}`, configError);
      }

      if (getErrorCode(error) === 'E118') {
        send({ type: 'expired' });
      } else {
        send({ type: 'invalidUrlReceived' });
      }

      showRequestError(error);
      return;
    }

    if (onboardingConfig?.isLive === true && orgIds.has(onboardingConfig?.orgId)) {
      setupLogger(onboardingConfig);
    }

    if (businessBoKycData || onboardingConfig) {
      trackAction('hosted:started');
      send({
        type: 'initContextUpdated',
        payload: {
          businessBoKycData,
          onboardingConfig,
        },
      });
    }
  }, [
    isGetBusinessLoading,
    isGetOnboardingConfigLoading,
    queryGetBusiness.error,
    queryGetOnboardingConfig.error,
    onboardingConfig,
    businessBoKycData,
    orgIds,
  ]);

  return (
    <Container>
      <Stack flexDirection="column" justifyContent="center" alignItems="center" rowGap={5}>
        <Avatar />
        <Stack flexDirection="column" justifyContent="center" alignItems="center" rowGap={3} marginTop={5}>
          <Title />
          <Subtitle />
        </Stack>
      </Stack>
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

export default Init;
