import type { OverallOutcome } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import ErrorComponent from '@/components/error';
import useOnboardingProcess from '@/hooks/use-onboarding-process';

export type ProcessProps = {
  onDone: () => void;
  authToken: string;
  overallOutcome?: OverallOutcome;
};

const Process = ({ onDone, authToken, overallOutcome }: ProcessProps) => {
  const processMutation = useOnboardingProcess();
  const { isError } = processMutation;

  useEffectOnce(() => {
    if (!authToken || processMutation.isLoading) {
      return;
    }
    processMutation.mutate(
      { authToken, fixtureResult: overallOutcome },
      {
        onSuccess: onDone,
      },
    );
  });

  return isError ? <ErrorComponent /> : <LoadingIndicator />;
};

export default Process;
