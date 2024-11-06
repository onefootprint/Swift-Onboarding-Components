import { Logger, getLogger, trackAction, useBusiness, useGetOnboardingConfig } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
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
  const { DoNotRecordTenantOrgIdOnLogRocket } = useFlags();
  const orgIds = new Set<string>(DoNotRecordTenantOrgIdOnLogRocket);

  const queryGetBusiness = useBusiness({ obConfigAuth });
  const isGetBusinessLoading = queryGetBusiness.isFetching && queryGetBusiness.isPending;
  const businessBoKycData = queryGetBusiness.data;

  const queryGetOnboardingConfig = useGetOnboardingConfig({ obConfigAuth, authToken });
  const isGetOnboardingConfigLoading = queryGetOnboardingConfig.isFetching && queryGetOnboardingConfig.isPending;
  const onboardingConfigResponse = queryGetOnboardingConfig.data;

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
      send({ type: 'errorReceived', payload: { error: err } });
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

      send({ type: 'errorReceived', payload: { error } });
      return;
    }

    const { config, workflowRequest } = onboardingConfigResponse || {};
    if (config?.isLive === true && orgIds.has(config?.orgId)) {
      setupLogger(config);
    }

    if (businessBoKycData || config) {
      trackAction('hosted:started');
      send({
        type: 'initContextUpdated',
        payload: {
          businessBoKycData,
          onboardingConfig: config,
          workflowRequest,
        },
      });
    }
  }, [
    isGetBusinessLoading,
    isGetOnboardingConfigLoading,
    queryGetBusiness.error,
    queryGetOnboardingConfig.error,
    onboardingConfigResponse,
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
