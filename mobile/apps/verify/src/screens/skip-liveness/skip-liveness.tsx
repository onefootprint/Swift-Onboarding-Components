import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useSkipLiveness from '@/hooks/use-skip-liveness';

type SkipLivenessProps = {
  authToken: string;
  onComplete: () => void;
  onError: () => void;
};

const SkipLiveness = ({
  onComplete,
  onError,
  authToken,
}: SkipLivenessProps) => {
  const skipLivenessMutation = useSkipLiveness();

  useEffectOnce(() => {
    if (!authToken) {
      return;
    }

    skipLivenessMutation.mutate(
      { authToken },
      {
        onSuccess: onComplete,
        onError,
      },
    );
  });

  return <LoadingIndicator />;
};

export default SkipLiveness;
