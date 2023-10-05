import { Logger } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import { LoadingIndicator } from '@onefootprint/ui';
import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

import Error from '../../../../components/error';
import { useOnboardingRequirementsMachine } from '../../components/machine-provider';
import useOnboardingProcess from '../../hooks/use-onboarding-process';

export type ProcessProps = {
  onDone: () => void;
};

const Process = ({ onDone }: ProcessProps) => {
  const [state] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken },
  } = state.context;
  const processMutation = useOnboardingProcess();
  const { isError } = processMutation;

  useEffectOnce(() => {
    if (!authToken || processMutation.isLoading) {
      return;
    }
    processMutation.mutate(
      { authToken },
      {
        onSuccess: onDone,
        onError: (error: unknown) => {
          console.error(
            'Error while processing onboarding on authorize page',
            getErrorMessage(error),
          );
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
      <LoadingIndicator />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Process;
