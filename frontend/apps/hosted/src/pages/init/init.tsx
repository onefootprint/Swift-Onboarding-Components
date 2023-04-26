import { useRequestErrorToast } from '@onefootprint/hooks';
import { useGetOnboardingConfig } from '@onefootprint/idv-elements';
import { BusinessResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import useGetAuthToken from './hooks/use-get-auth-token';
import useGetBusiness from './hooks/use-get-business';

const Init = () => {
  const [state, send] = useHostedMachine();
  const { authToken = '' } = state.context;
  const showRequestError = useRequestErrorToast();

  useGetAuthToken(token => {
    send({
      type: 'initContextUpdated',
      payload: {
        authToken: token,
      },
    });
  });

  useGetBusiness(authToken, {
    onSuccess: (data: BusinessResponse) => {
      send({
        type: 'initContextUpdated',
        payload: {
          businessBoKycData: { ...data },
        },
      });
    },
    onError: showRequestError,
  });

  useGetOnboardingConfig(
    { kybBoAuthToken: authToken },
    {
      onSuccess: onboardingConfig => {
        send({
          type: 'initContextUpdated',
          payload: {
            onboardingConfig,
          },
        });
      },
      onError: showRequestError,
    },
  );

  return <LoadingIndicator />;
};

export default Init;
