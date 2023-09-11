import { getErrorMessage } from '@onefootprint/request';
import styled from '@onefootprint/styled';
import type { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator } from '@onefootprint/ui';
import * as LogRocket from 'logrocket';
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
    LogRocket.log('checkRequirements', response);

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

  const handleError = (err: unknown) => {
    console.error(
      'Error while checking requirements from onboarding status',
      getErrorMessage(err),
    );
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
