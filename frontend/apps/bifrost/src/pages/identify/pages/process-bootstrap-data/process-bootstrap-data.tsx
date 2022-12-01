import { ChallengeData } from '@onefootprint/types';
import React from 'react';
import InitShimmer from 'src/components/init-shimmer';
import { Events } from 'src/hooks/use-identify-machine';

import useIdentifyMachine from '../../hooks/use-identify-machine';
import useProcessBootstrapData from './hooks/use-process-bootstrap-data';

const ProcessBootstrapData = () => {
  const [state, send] = useIdentifyMachine();
  const { bootstrapData, identifyType } = state.context;

  const handleError = () => {
    send({
      type: Events.bootstrapDataProcessErrored,
    });
  };

  const handleChallengeSent = (
    userFound: boolean,
    challengeData: ChallengeData,
  ) => {
    send({
      type: Events.bootstrapDataProcessed,
      payload: {
        userFound,
        challengeData,
      },
    });
  };

  useProcessBootstrapData({
    bootstrapData,
    identifyType,
    options: {
      onSuccess: handleChallengeSent,
      onError: handleError,
    },
  });

  return <InitShimmer />;
};

export default ProcessBootstrapData;
