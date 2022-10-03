import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { OnboardingStatusResponse } from '@onefootprint/types/src/api/onboarding-status';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Events } from 'src/utils/state-machine/onboarding-requirements';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useGetOnboardingStatus from './hooks/use-onboarding-status';

const CheckOnboardingRequirements = () => {
  const { t } = useTranslation('pages.check-onboarding-requirements');
  const [, send] = useOnboardingRequirementsMachine();
  const [error, setError] = useState(false);

  const handleSuccess = (response: OnboardingStatusResponse) => {
    const { requirements, missingKycData } = response;
    send({
      type: Events.onboardingRequirementsReceived,
      payload: {
        requirements,
        missingKycData: missingKycData ?? [],
      },
    });
  };

  const handleError = () => {
    setError(true);
  };

  useGetOnboardingStatus({
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
    row-gap: ${theme.spacing[2]}px;
    justify-content: center;
  `}
`;

const Container = styled.div`
  flex-direction: column;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default CheckOnboardingRequirements;
