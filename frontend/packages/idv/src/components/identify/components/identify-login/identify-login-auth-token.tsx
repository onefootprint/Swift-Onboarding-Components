'use client';

import { getLogger } from '@/idv/utils';
import { UserTokenScope } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import { IdentifyVariant } from '../../identify.types';
import type { DoneArgs } from '../../identify.types';
import Loading from '../loading';
import Notification from './components/notification';
import useEffectOnceStrict from './hooks/use-effect-once-strict';
import IdentifyLogin, { type LoginInitialArgs } from './identify-login';
import { useIdentify } from './queries';
import getTokenScope from './utils/token-scope';

type IdentifyLoginAuthTokenProps = {
  onDone: (args: DoneArgs) => void;
  onBack?: () => void;
  handleReset?: () => void;
  initialArgs: Omit<LoginInitialArgs, 'identify'> & { initialAuthToken: string };
};

const requiredScopes: Record<IdentifyVariant, UserTokenScope[]> = {
  [IdentifyVariant.auth]: [],
  [IdentifyVariant.updateLoginMethods]: [UserTokenScope.explicitAuth],
  [IdentifyVariant.verify]: [],
};

const { logError } = getLogger({ location: 'identify-login' });

const IdentifyLoginAuthToken = ({
  onDone,
  onBack,
  handleReset,
  initialArgs,
}: IdentifyLoginAuthTokenProps): JSX.Element | null => {
  const scope = getTokenScope(initialArgs.variant);
  const variantScopes = requiredScopes[initialArgs.variant] || [];
  const mutIdentify = useIdentify({ obConfigAuth: initialArgs.obConfigAuth, scope });
  const { t } = useTranslation('identify');

  const { initialAuthToken, ...args } = initialArgs;

  const identifyViaToken = async () => {
    // Identify the user via auth token and then move to the login challenge
    mutIdentify.mutate(
      { authToken: initialArgs.initialAuthToken },
      {
        onError: e => {
          logError('Identifying user by auth token failed in init-auth-token page in identify', e);
        },
        onSuccess: res => {
          if (!res.user) {
            logError('Identifying user by auth token returned no user in init-auth-token page in identify');
            return;
          }
          // Require the user to re-auth if either the token has no scopes or the Identify
          // variant requires a scope and the token doesn't have it
          const needsAuth =
            res.user?.tokenScopes?.length === 0 || variantScopes.some(s => !res.user?.tokenScopes?.includes(s));

          if (!needsAuth) {
            onDone({
              authToken: initialArgs.initialAuthToken,
              phoneNumber: initialArgs.phoneNumber,
              email: initialArgs.email,
              availableChallengeKinds: res.user?.availableChallengeKinds,
            });
          }
        },
      },
    );
  };

  useEffectOnceStrict(() => {
    identifyViaToken();
  });

  if (!mutIdentify.data && !mutIdentify.error) {
    return <Loading />;
  }

  if (mutIdentify.error || !mutIdentify.data.user) {
    return <Notification title={t('notification.404-user-title')} subtitle={t('notification.404-user-description')} />;
  }

  const machineArgs = {
    ...args,
    identify: {
      user: mutIdentify.data.user,
      identifyToken: mutIdentify.data.user.token,
    },
  };

  return <IdentifyLogin machineArgs={machineArgs} onDone={onDone} onBack={onBack} handleReset={handleReset} />;
};

export default IdentifyLoginAuthToken;
