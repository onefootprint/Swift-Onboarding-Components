import IcoCheckCircle40 from 'icons/ico/ico-check-circle-40';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const PhoneVerificationSuccess = () => (
  <PhoneVerificationSuccessContainer>
    <IcoCheckCircle40 color="success" />
    <Typography variant="label-3" color="success">
      Phone verified
    </Typography>
  </PhoneVerificationSuccessContainer>
);

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
