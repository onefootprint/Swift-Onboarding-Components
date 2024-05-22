import { UserTokenScope } from '@onefootprint/types';
import React from 'react';

import { getLogger } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import { IdentifyVariant, SuccessfulIdentifier } from '../../state/types';
import getTokenScope from '../../utils/token-scope';
import Loading from '../loading';

type InitAuthTokenProps = {
  authToken: string;
  children?: JSX.Element | null;
};

const { logError } = getLogger({ location: 'identify-init-auth-token' });

const requiredScopes: Record<IdentifyVariant, UserTokenScope[]> = {
  [IdentifyVariant.auth]: [],
  [IdentifyVariant.updateLoginMethods]: [UserTokenScope.explicitAuth],
  [IdentifyVariant.verify]: [],
};

const InitAuthToken = ({ authToken, children }: InitAuthTokenProps) => {
  const [state, send] = useIdentifyMachine();
  const { obConfigAuth, sandboxId, variant } = state.context;
  const scope = getTokenScope(variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });

  const identifyViaToken = async () => {
    // Identify the user via auth token and then move to the login challenge
    mutIdentify.mutate(
      { authToken },
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
            // Require the user to re-auth if either the token has no scopes or the Identify
            // variant requires a scope and the token doesn't have it
            const needsAuth =
              !res.user.tokenScopes.length ||
              requiredScopes[variant].some(
                s => !res.user?.tokenScopes.includes(s),
              );
            if (!needsAuth) {
              send({
                type: 'identifiedWithSufficientScopes',
                payload: { authToken },
              });
            } else {
              send({
                type: 'identifyResult',
                payload: {
                  user: res.user,
                  successfulIdentifiers: [SuccessfulIdentifier.authToken],
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
