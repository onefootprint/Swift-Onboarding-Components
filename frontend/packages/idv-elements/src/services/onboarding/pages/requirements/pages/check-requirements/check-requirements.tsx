import styled from '@onefootprint/styled';
import { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import React, { useState } from 'react';

import Error from '../../../../components/error';
import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useGetOnboardingStatus from '../authorize/hooks/use-get-onboarding-status';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const CheckRequirements = () => {
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    startedDataCollection,
    onboardingContext: { authToken, isTransfer },
    collectedKycData,
  } = state.context;
  const [error, setError] = useState(false);

  const handleSuccess = (response: OnboardingStatusResponse) => {
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

  const handleError = () => {
    setError(true);
  };

  useGetOnboardingStatus(authToken, {
    onSuccess: handleSuccess,
    onError: handleError,
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
