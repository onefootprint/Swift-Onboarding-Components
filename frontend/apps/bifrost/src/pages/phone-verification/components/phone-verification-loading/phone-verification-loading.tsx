import React from 'react';
import styled, { css } from 'styled-components';
import { LoadingIndicator, Typography } from 'ui';

const PhoneVerificationLoading = () => (
  <PhoneVerificationLoadingContainer>
    <LoadingIndicator />
    <Typography variant="label-3">Verifying...</Typography>
  </PhoneVerificationLoadingContainer>
);

const PhoneVerificationLoadingContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default PhoneVerificationLoading;
