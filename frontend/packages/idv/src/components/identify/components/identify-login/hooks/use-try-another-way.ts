import { ChallengeKind as Kind } from '@onefootprint/types';
import type { TFunction } from 'i18next';
import { useMemo } from 'react';

import { hasAuthMethodUnverifiedEmail } from '../../../../../utils';
import { useIdentifyMachine } from '../state';

const useTryAnotherWay = (t: TFunction<'identify'>) => {
  const [state, send] = useIdentifyMachine();
  const { user } = state.context.identify;
  const isNypid = !!user?.isUnverified;

  const action = useMemo(
    () =>
      hasAuthMethodUnverifiedEmail(user) && !isNypid
        ? {
            label: t('no-access-methods-label'),
            labelCta: t('send-code-to-email'),
            onClick: () => send({ type: 'tryAnotherWay', payload: Kind.email }),
          }
        : undefined,
    [send, user, t, isNypid],
  );

  return action;
};

export default useTryAnotherWay;
