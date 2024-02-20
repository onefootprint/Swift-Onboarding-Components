import React from 'react';

import { getLogger } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import getTokenScope from '../../utils/token-scope';
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
  const scope = getTokenScope(state.context.variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });

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
          if (res.user) {
            const needsAuth = !res.user.tokenScopes.length;
            if (!needsAuth) {
              send({
                type: 'identifiedWithSufficientScopes',
                payload: { authToken },
              });
            } else {
              send({
                type: 'identified',
                payload: {
                  user: res.user,
                  successfulIdentifier: identifier,
                },
              });
            }
          } else {
            // We should never have a case where the auth token doesn't uniquely identify a user
            send({ type: 'authTokenInvalid' });
          }
        },
      },
    );
  };

  useEffectOnceStrict(() => {
    identifyViaToken();
  });

  return <Loading>{children}</Loading>;
};

export default InitAuthToken;
