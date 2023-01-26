import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const PhoneVerificationSuccess = () => {
  const { t } = useTranslation('pages.phone-verification.form.success');
  const [state] = useIdentifyMachine();
  const { tenantPk } = state.context;
  const isOnboardingSession = !!tenantPk;
  return (
    <PhoneVerificationSuccessContainer>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {isOnboardingSession
          ? t('onboarding-description')
          : t('authentication-description')}
      </Typography>
    </PhoneVerificationSuccessContainer>
  );
};

const PhoneVerificationSuccessContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    gap: ${theme.spacing[4]};
  `}
`;

export default PhoneVerificationSuccess;
