import { IdDI } from '@onefootprint/types';
import React from 'react';

import { getLogger, validateBootstrapData } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import getTokenScope from '../../utils/token-scope';
import Loading from '../loading';

type StepBootstrapProps = { children?: JSX.Element | null };

const { logError } = getLogger('auth-init-bootstrap');

const StepBootstrap = ({ children }: StepBootstrapProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    obConfigAuth,
    identify: { sandboxId },
  } = state.context;
  const scope = getTokenScope(state.context.variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });

  const processBootstrapData = async () => {
    const { email, phoneNumber } = validateBootstrapData(bootstrapData);
    if (!email && !phoneNumber) {
      send({ type: 'bootstrapDataInvalid' });
      return;
    }

    const identifyResult = await mutIdentify
      .mutateAsync({
        email,
        phoneNumber,
      })
      .catch((error: unknown) => {
        logError('Identifying user by auth token failed in identify', error);
        return undefined;
      });
    if (
      !identifyResult?.user ||
      !identifyResult.user.availableChallengeKinds?.length
    ) {
      send({ type: 'identifyFailed', payload: { email, phoneNumber } });
      return;
    }
    const { user } = identifyResult;
    let successfulIdentifier;
    if (user.matchingFps.includes(IdDI.phoneNumber) && phoneNumber) {
      successfulIdentifier = { phoneNumber };
    } else if (user.matchingFps.includes(IdDI.email) && email) {
      successfulIdentifier = { email };
    }

    send({
      type: 'identified',
      payload: {
        user: identifyResult.user,
        email,
        phoneNumber,
        successfulIdentifier,
      },
    });
  };

  useEffectOnceStrict(() => {
    processBootstrapData();
  });

  return <Loading>{children}</Loading>;
};

export default StepBootstrap;
