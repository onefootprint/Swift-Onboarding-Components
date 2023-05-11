import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import {
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import { Requirements } from '../../utils/state-machine';
import useGetOnboardingStatus from '../authorize/hooks/use-get-onboarding-status';

const CheckRequirements = () => {
  const { t } = useTranslation('pages.check-requirements');
  const [state, send] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken },
  } = state.context;
  const [error, setError] = useState(false);

  const handleSuccess = (response: OnboardingStatusResponse) => {
    const { requirements } = response;
    const payload = {} as Requirements;

    requirements.forEach(req => {
      if (req.kind === OnboardingRequirementKind.collectKybData) {
        payload.kyb = req;
      } else if (req.kind === OnboardingRequirementKind.collectKycData) {
        payload.kyc = req;
      } else if (req.kind === OnboardingRequirementKind.liveness) {
        payload.liveness = req;
      } else if (req.kind === OnboardingRequirementKind.idDoc) {
        payload.idDoc = req;
      } else if (req.kind === OnboardingRequirementKind.investorProfile) {
        payload.investorProfile = req;
      } else if (req.kind === OnboardingRequirementKind.authorize) {
        payload.authorize = req;
      }
    });

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
