import { validateBootstrapData } from '@onefootprint/idv';
import partial from 'lodash/fp/partial';
import React, { useMemo } from 'react';

import { useEffectOnceStrict } from '@/src/hooks';
import { useIdentify } from '@/src/queries';
import { useAuthMachine } from '@/src/state';

import BaseLoading from '../loading/base-loading';
import { identify, identifyMutationCaller } from './utils';

type StepBootstrapProps = { children?: JSX.Element | null };

const StepBootstrap = ({ children }: StepBootstrapProps) => {
  const [state, send] = useAuthMachine();
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
    if (!identifyResult || !identifyResult.availableChallengeKinds?.length) {
      send({ type: 'identifyFailed', payload: { email, phoneNumber } });
      return;
    }

    send({
      type: 'identified',
      payload: {
        userFound: true,
        isUnverified: identifyResult.isUnverified || false,
        email,
        phoneNumber,
        successfulIdentifier: identifyResult.successfulIdentifier,
        availableChallengeKinds: identifyResult.availableChallengeKinds,
        hasSyncablePassKey: identifyResult.hasSyncablePassKey,
      },
    });
  };

  useEffectOnceStrict(() => {
    processBootstrapData();
  });

  return <BaseLoading>{children}</BaseLoading>;
};

export default StepBootstrap;
