import { SkipLivenessClientType, SkipLivenessReason } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useSkipLiveness from '@/hooks/use-skip-liveness';

type SkipLivenessProps = {
  authToken: string;
  onComplete: () => void;
  onError: () => void;
};

const SkipLiveness = ({ onComplete, onError, authToken }: SkipLivenessProps) => {
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    if (!authToken) {
      return;
    }

    const context = {
      clientType: SkipLivenessClientType.mobile,
      // TODO should track and populate these when the verify app is actually used
      reason: SkipLivenessReason.unknown,
      numAttempts: 0,
      attempts: [],
    };
    skipLivenessMutation.mutate(
      { authToken, context },
      {
        onSuccess: onComplete,
        onError,
      },
    );
  });

  return <LoadingIndicator />;
};

export default SkipLiveness;
