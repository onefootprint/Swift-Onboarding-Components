import type { OnboardingRequirement, OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import ErrorComponent from '@/components/error';
import useGetOnboardingStatus from '@/hooks/use-get-onboarding-status';
import useOnboarding from '@/hooks/use-onboarding';

import computeRequirementsToShow from './utils/compute-requirements-to-show';

type CheckRequirementsProps = {
  authToken: string;
  startedDataCollection?: boolean;
  collectedKycData?: boolean;
  onComplete: (requirement: OnboardingRequirement[]) => void;
};

const CheckRequirements = ({
  authToken,
  startedDataCollection,
  collectedKycData,
  onComplete,
}: CheckRequirementsProps) => {
  const [error, setError] = useState(false);
  const onboardingMutation = useOnboarding();
  const onboardingInitialized = startedDataCollection || onboardingMutation.isSuccess;

  useEffectOnce(() => {
    // Only initialize the onboarding once at the start (before fetching the requirements)
    if (onboardingInitialized || onboardingMutation.isLoading) {
      return;
    }
    onboardingMutation.mutate(
      { authToken },
      {
        onError: () => {
          setError(true);
        },
      },
    );
  });

  const handleOnboardingStatus = (response: OnboardingStatusResponse) => {
    // TODO: this call requires isTransfer argument when we add transfer support
    const payload = computeRequirementsToShow(!!startedDataCollection, !!collectedKycData, response);
    onComplete(payload);
  };

  const handleOnboardingStatusError = () => {
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

  return error ? <ErrorComponent /> : <LoadingIndicator />;
};

export default CheckRequirements;
