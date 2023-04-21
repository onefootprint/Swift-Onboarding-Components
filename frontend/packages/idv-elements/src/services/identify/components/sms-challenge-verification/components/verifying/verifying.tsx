import { useTranslation } from '@onefootprint/hooks';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Verifying = () => {
  const { t } = useTranslation('components.sms-challenge-verification');

  return (
    <Container>
      <Box sx={{ width: '40px', height: '40px' }}>
        <LoadingIndicator />
      </Box>
      <Typography variant="label-3">{t('verifying')}</Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100px;
    row-gap: ${theme.spacing[8]};
  `}
`;

export default Verifying;
