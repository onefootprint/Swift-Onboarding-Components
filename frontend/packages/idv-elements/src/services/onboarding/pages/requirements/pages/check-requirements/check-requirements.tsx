import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import type { OnboardingStatusResponse } from '@onefootprint/types';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useGetOnboardingStatus } from '../../../../../../hooks/api';
import Logger from '../../../../../../utils/logger';
import Error from '../../../../components/error';
import useOnboardingProcess from '../../hooks/use-onboarding-process';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useOnboarding from './hooks/use-onboarding';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const CheckRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    startedDataCollection,
    onboardingContext: { authToken, isTransfer, overallOutcome },
    collectedKycData,
  } = state.context;
  const [error, setError] = useState(false);
  const onboardingMutation = useOnboarding();
  const processMutation = useOnboardingProcess();
  const onboardingInitialized =
    startedDataCollection || onboardingMutation.isSuccess;

  useEffectOnce(() => {
    // Only initialize the onboarding once at the start (before fetching the requirements)
    if (onboardingInitialized || onboardingMutation.isLoading) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onError: (err: unknown) => {
          Logger.error(
            `Error while initiating onboarding. ${getErrorMessage(err)}`,
            'onboarding-check-requirements',
          );
          setError(true);
        },
      },
    );
  });

  const handleOnboardingStatus = (response: OnboardingStatusResponse) => {
    Logger.info('checkRequirements', response);

    const payload = computeRequirementsToShow(
      !!isTransfer,
      startedDataCollection,
      { collectedKycData: !!collectedKycData },
      response,
    );

    // Process is a requirement for making an API call - just run it here if it is the next requirement
    // Then refetch status and move on.
    if (
      !isTransfer &&
      payload.length &&
      payload[0].kind === OnboardingRequirementKind.process
    ) {
      processMutation.mutate(
        { authToken, fixtureResult: overallOutcome },
        {
          onSuccess: refetch,
          onError: (processErr: unknown) => {
            console.error(
              'Error while running process from check-requirements page',
              getErrorMessage(processErr),
            );
            setError(true);
          },
        },
      );
    } else {
      send({
        type: 'onboardingRequirementsReceived',
        payload,
      });
    }
  };

  const handleOnboardingStatusError = (err: unknown) => {
    Logger.error(
      `Error while checking requirements from onboarding status: ${getErrorMessage(
        err,
      )}`,
      'onboarding-check-requirements',
    );
    setError(true);
  };

  const { refetch } = useGetOnboardingStatus({
    authToken,
    enabled: onboardingInitialized,
    options: {
      onSuccess: handleOnboardingStatus,
      onError: handleOnboardingStatusError,
    },
  });

  return error ? (
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
  height: 100%;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default CheckRequirements;
