import { getLogger } from '@onefootprint/idv';
import React from 'react';

import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import Loading from '../loading';

type InitAuthTokenProps = {
  authToken: string;
  children?: JSX.Element | null;
};

const { logError } = getLogger('identify-init-auth-token');

const InitAuthToken = ({ authToken, children }: InitAuthTokenProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    obConfigAuth,
    identify: { sandboxId },
  } = state.context;
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId });

  const identifyViaToken = async () => {
    // Identify the user via auth token and then move to the login challenge
    const identifier = { authToken };
    mutIdentify.mutate(
      { identifier },
      {
        onError: e => {
          logError(
            'Identifying user by auth token failed in init-auth-token page in identify',
            e,
          );
          send({ type: 'authTokenInvalid' });
        },
        onSuccess: res => {
          send({
            type: 'identified',
            payload: {
              user: res.user,
              successfulIdentifier: identifier,
            },
          });
        },
      },
    );
  };

  // One day, we may want to first check if the token has sufficient scopes or not
  useEffectOnceStrict(() => {
    identifyViaToken();
  });

  return <Loading>{children}</Loading>;
};

export default InitAuthToken;
