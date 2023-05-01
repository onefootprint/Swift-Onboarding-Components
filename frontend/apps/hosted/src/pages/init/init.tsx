import { useRequestErrorToast } from '@onefootprint/hooks';
import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import { BusinessResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled from 'styled-components';

import useGetBusiness from './hooks/use-get-business';
import useUrlParams from './hooks/use-url-params';

const Init = () => {
  const [, send] = useHostedMachine();
  const showRequestError = useRequestErrorToast();
  const { authToken = '', tenantPk = '' } = useUrlParams();

  useGetBusiness(authToken, {
    onSuccess: (data: BusinessResponse) => {
      send({
        type: 'initContextUpdated',
        payload: {
          authToken,
          businessBoKycData: { ...data },
        },
      });
    },
    onError: showRequestError,
  });

  useGetOnboardingConfig(
    { kybBoAuthToken: authToken, tenantPk },
    {
      onSuccess: onboardingConfig => {
        send({
          type: 'initContextUpdated',
          payload: {
            authToken,
            tenantPk: onboardingConfig.key,
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
`;

export default Init;
