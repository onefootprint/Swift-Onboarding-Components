import { getErrorMessage } from '@onefootprint/request';
import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import Logger from '../../../../../../utils/logger';
import Error from '../../../../components/error';
import { useOnboardingRequirementsMachine } from '../../components/machine-provider';
import useOnboardingProcess from '../../hooks/use-onboarding-process';

export type ProcessProps = {
  onDone: () => void;
};

const Process = ({ onDone }: ProcessProps) => {
  const [state] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken, overallOutcome },
  } = state.context;
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
        onError: (error: unknown) => {
          Logger.error(
            `Error while processing onboarding on authorize page. ${getErrorMessage(
              error,
            )}`,
            'onboarding-process',
          );
        },
      },
    );
  });

  return isError ? (
    <Error />
  ) : (
    <Container>
      <AnimatedLoadingSpinner animationStart />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Process;
