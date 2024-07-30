import { IdDI } from '@onefootprint/types';
import React from 'react';

import { getLogger } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import { SuccessfulIdentifier } from '../../state/types';
import getTokenScope from '../../utils/token-scope';
import Loading from '../loading';

type StepBootstrapProps = { children?: JSX.Element | null };

const { logError } = getLogger({ location: 'auth-init-bootstrap' });

const StepBootstrap = ({ children }: StepBootstrapProps) => {
  const [state, send] = useIdentifyMachine();
  const { phoneNumber, email, obConfigAuth, sandboxId } = state.context;
  const scope = getTokenScope(state.context.variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });

  const processBootstrapData = async () => {
    if (mutIdentify.isLoading || mutIdentify.isSuccess || mutIdentify.isError) {
      return;
    }

    const user = await mutIdentify
      .mutateAsync({
        email: email?.value,
        phoneNumber: phoneNumber?.value,
      })
      .then(res => res.user)
      .catch((error: unknown) => {
        logError('Identifying user by bootstrap data failed in identify', error);
        return undefined;
      });

    const successfulIdentifiers = [];
    if (user?.matchingFps?.includes(IdDI.phoneNumber)) {
      successfulIdentifiers.push(SuccessfulIdentifier.phone);
    } else if (user?.matchingFps?.includes(IdDI.email)) {
      successfulIdentifiers.push(SuccessfulIdentifier.email);
    }

    send({
      type: 'bootstrapReceived',
      payload: {
        user,
        successfulIdentifiers,
      },
    });
  };

  useEffectOnceStrict(() => {
    processBootstrapData();
  });

  return <Loading>{children}</Loading>;
};

export default StepBootstrap;
