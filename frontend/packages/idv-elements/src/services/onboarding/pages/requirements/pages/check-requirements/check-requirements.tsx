import { Logger } from '@onefootprint/dev-tools';
import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import type { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { useGetOnboardingStatus } from '../../../../../../hooks/api';
import Error from '../../../../components/error';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useOnboarding from './hooks/use-onboarding';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const CheckRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    startedDataCollection,
    onboardingContext: { authToken, isTransfer },
    collectedKycData,
  } = state.context;
  const [error, setError] = useState(false);
  const onboardingMutation = useOnboarding();
  const onboardingInitialized =
    startedDataCollection || onboardingMutation.isSuccess;

  useEffectOnce(() => {
    // Only initialize the onboarding once at the start (before fetching the requirements)
    if (onboardingInitialized) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onError: (err: unknown) => {
          console.error(
            'Error while initiating onboarding.',
            getErrorMessage(err),
          );
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
    send({
      type: 'onboardingRequirementsReceived',
      payload,
    });
  };

  const handleOnboardingStatusError = (err: unknown) => {
    console.error(
      'Error while checking requirements from onboarding status',
      getErrorMessage(err),
    );
    Logger.error(
      `Error while checking requirements from onboarding status: ${getErrorMessage(
        err,
      )}`,
      'onboarding-check-requirements',
    );
    setError(true);
  };

  useGetOnboardingStatus({
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
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default CheckRequirements;
