import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { OnboardingStatusResponse } from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useGetOnboardingStatus from '../authorize/hooks/use-get-onboarding-status';
import computeRequirementsToShow from './utils/compute-requirements-to-show';

const CheckRequirements = () => {
  const { t } = useTranslation('pages.check-requirements');
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken, isTransfer },
    collectedKycData,
  } = state.context;
  const [error, setError] = useState(false);

  const handleSuccess = (response: OnboardingStatusResponse) => {
    const payload = computeRequirementsToShow(
      !!isTransfer,
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

  if (error) {
    return (
      <Container>
        <TitleContainer>
          <IcoForbid40 color="error" />
          <Typography variant="heading-3">{t('error.title')}</Typography>
        </TitleContainer>
        <Typography variant="body-2">{t('error.description')}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingIndicator />
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const Container = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default CheckRequirements;
