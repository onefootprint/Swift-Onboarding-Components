import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, LoadingIndicator, Typography } from '@onefootprint/ui';
import React from 'react';

const Verifying = () => {
  const { t } = useTranslation('components.sms-challenge-verification');

  return (
    <Container>
      <Box
        sx={{
          width: '40px',
          height: '40px',
          justifyContent: 'center',
          display: 'flex',
        }}
      >
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
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Verifying;
