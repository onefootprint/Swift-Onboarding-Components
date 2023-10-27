import { getErrorMessage } from '@onefootprint/request';
import { UserTokenScope } from '@onefootprint/types';
import React from 'react';

import { InitShimmer } from '../../../../components';
import { useIdentify, useUserToken } from '../../../../hooks';
import Logger from '../../../../utils/logger';
import useIdentifyMachine from '../../hooks/use-identify-machine';

type InitAuthTokenProps = {
  authToken: string;
};

const InitAuthToken = ({ authToken }: InitAuthTokenProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    obConfigAuth,
    identify: { sandboxId },
  } = state.context;
  const identifyMutation = useIdentify();

  const verifyToken = async () => {
    // Identify the user via auth token and then move to the login challenge
    const identifier = { authToken };
    try {
      const authTokenIdentify = await identifyMutation.mutateAsync({
        obConfigAuth,
        sandboxId,
        identifier,
      });
      const {
        userFound,
        isUnverified,
        availableChallengeKinds,
        hasSyncablePassKey = false,
      } = authTokenIdentify || {};
      if (userFound) {
        send({
          type: 'identified',
          payload: {
            userFound,
            isUnverified,
            successfulIdentifier: identifier,
            availableChallengeKinds,
            hasSyncablePassKey,
          },
        });
        return;
      }
    } catch (e) {
      Logger.error(
        `Identifying user by auth token failed in init-auth-token page in identify ${getErrorMessage(
          e,
        )}`,
        'identify-init-auth-token',
      );
    }
    send({ type: 'authTokenInvalid' });
  };

  useUserToken(
    { authToken },
    {
      onSuccess: async payload => {
        // If the auth token has insufficient scopes for onboarding, we need to step up
        const needsStepUp = !payload.scopes.includes(UserTokenScope.signup);
        if (!needsStepUp) {
          send({ type: 'hasSufficientScopes', payload: { authToken } });
        } else {
          await verifyToken();
        }
      },
      onError: error => {
        Logger.error(
          `Fetching token in InitAuthToken failed. ${getErrorMessage(error)}`,
          'identify-init-auth-token',
        );
        send({ type: 'authTokenInvalid' });
      },
    },
  );

  return <InitShimmer />;
};

export default InitAuthToken;
