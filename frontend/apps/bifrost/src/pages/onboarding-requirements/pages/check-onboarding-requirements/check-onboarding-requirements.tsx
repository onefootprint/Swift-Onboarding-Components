import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import {
  OnboardingRequirement,
  OnboardingRequirementKind,
  OnboardingStatusResponse,
} from '@onefootprint/types';
import { CollectedDataOption } from '@onefootprint/types/src/data/collected-data-option';
import { LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import { Events } from 'src/utils/state-machine/onboarding-requirements';
import styled, { css } from 'styled-components';

import useOnboardingRequirementsMachine from '../../hooks/use-onboarding-requirements-machine';
import useGetOnboardingStatus from './hooks/use-get-onboarding-status';

const CheckOnboardingRequirements = () => {
  const { t } = useTranslation('pages.check-onboarding-requirements');
  const [, send] = useOnboardingRequirementsMachine();
  const [error, setError] = useState(false);

  const handleSuccess = (response: OnboardingStatusResponse) => {
    const { requirements } = response;

    let missingLiveness = false;
    let missingIdDocument = false;
    let missingKycData: CollectedDataOption[] = [];

    requirements.forEach((req: OnboardingRequirement) => {
      if (req.kind === OnboardingRequirementKind.collectKycData) {
        if (req.missingAttributes.length) {
          missingKycData = [...req.missingAttributes];
        }
      }
      if (req.kind === OnboardingRequirementKind.liveness) {
        missingLiveness = true;
      }
      if (req.kind === OnboardingRequirementKind.collectDocument) {
        missingIdDocument = true;
      }
    });

    send({
      type: Events.onboardingRequirementsReceived,
      payload: {
        missingLiveness,
        missingIdDocument,
        missingKycData,
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
