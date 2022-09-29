import { useTranslation } from '@onefootprint/hooks';
import { IcoCheckCircle40 } from '@onefootprint/icons';
import { IdentifyType } from '@onefootprint/types';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

import useIdentifyMachine from '../../../../hooks/use-identify-machine';

const PhoneVerificationSuccess = () => {
  const [state] = useIdentifyMachine();
  const { identifyType } = state.context;
  const { t } = useTranslation('pages.phone-verification.form.success');
  return (
    <PhoneVerificationSuccessContainer>
      <IcoCheckCircle40 color="success" />
      <Typography variant="label-3" color="success">
        {identifyType === IdentifyType.onboarding
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
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default PhoneVerificationSuccess;
