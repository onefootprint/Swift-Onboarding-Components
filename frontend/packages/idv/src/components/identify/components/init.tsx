import ErrorComponent from '@/idv/pages/onboarding/components/error';
import { getLogger } from '@/idv/utils';
import { postHostedIdentifySession } from '@onefootprint/axios';
import { useRequestErrorToast } from '@onefootprint/hooks';
import type { IdentifyScope } from '@onefootprint/request-types';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Context } from '../identify.types';
import { IdentifyVariant } from './identify-login';
import Loading from './loading';

const { logError } = getLogger({ location: 'identify-init' });

const variantToTokenScope: Record<IdentifyVariant, IdentifyScope> = {
  [IdentifyVariant.auth]: 'auth',
  [IdentifyVariant.updateLoginMethods]: 'auth',
  [IdentifyVariant.verify]: 'onboarding',
};

type InitProps = {
  context: Context;
  onDone: (identifyToken: string) => Promise<void>;
};

const Init = ({ context, onDone }: InitProps) => {
  const { state, initArgs } = context;
  const showRequestErrorToast = useRequestErrorToast();
  const sessionInitMutation = useMutation({
    mutationFn: async () => {
      const { data } = await postHostedIdentifySession({
        body: {
          data: {
            'id.email': state.email?.value,
            'id.phone_number': state.phoneNumber?.value,
          },
          scope: variantToTokenScope[initArgs.variant],
        },
        headers: {
          ...initArgs.obConfigAuth,
          'X-Fp-Is-Bootstrap': state.email?.isBootstrap || state.phoneNumber?.isBootstrap,
          'X-Fp-Is-Components-Sdk': initArgs.isComponentsSdk,
          'X-Sandbox-Id': initArgs.isLive ? undefined : initArgs.sandboxId,
        },
        throwOnError: true,
      });

      await onDone(data.token);
    },
    onError: error => {
      logError('Error while initializing identify session:', error);
      showRequestErrorToast(error);
    },
  });

  useEffect(() => {
    sessionInitMutation.mutate();
  }, []);

  if (sessionInitMutation.isError) {
    return <ErrorComponent error={sessionInitMutation.error} />;
  }

  return <Loading />;
};

export default Init;
