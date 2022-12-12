import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const PhoneVerificationSuccess = () => {
  const { t } = useTranslation('pages.phone-verification.form.success');
  return (
    <PhoneVerificationSuccessContainer>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {t('onboarding-description')}
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
    row-gap: ${theme.spacing[8]};
  `}
`;

export default PhoneVerificationSuccess;
