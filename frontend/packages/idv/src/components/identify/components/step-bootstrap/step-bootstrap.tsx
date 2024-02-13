import partial from 'lodash/fp/partial';
import React, { useMemo } from 'react';

import { validateBootstrapData } from '../../../../utils';
import useEffectOnceStrict from '../../hooks/use-effect-once-strict';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import Loading from '../loading';
import { identify, identifyMutationCaller } from './utils';

type StepBootstrapProps = { children?: JSX.Element | null };

const StepBootstrap = ({ children }: StepBootstrapProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    bootstrapData,
    obConfigAuth,
    identify: { sandboxId },
  } = state.context;

  const mutIdentify = useIdentify({ obConfigAuth, sandboxId });
  const memo = useMemo(
    () => {
      const identifyCaller = partial(identifyMutationCaller, [mutIdentify]);
      return {
        identify: partial(identify, [identifyCaller]),
      };
    },
    [obConfigAuth, sandboxId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const processBootstrapData = async () => {
    const { email, phoneNumber } = validateBootstrapData(bootstrapData);
    if (!email && !phoneNumber) {
      send({ type: 'bootstrapDataInvalid' });
      return;
    }

    const identifyResult = await memo.identify(email, phoneNumber);
    if (
      !identifyResult ||
      !identifyResult.user?.availableChallengeKinds?.length
    ) {
      send({ type: 'identifyFailed', payload: { email, phoneNumber } });
      return;
    }

    send({
      type: 'identified',
      payload: {
        user: identifyResult.user,
        email,
        phoneNumber,
        successfulIdentifier: identifyResult.successfulIdentifier,
      },
    });
  };

  useEffectOnceStrict(() => {
    processBootstrapData();
  });

  return <Loading>{children}</Loading>;
};

export default StepBootstrap;
