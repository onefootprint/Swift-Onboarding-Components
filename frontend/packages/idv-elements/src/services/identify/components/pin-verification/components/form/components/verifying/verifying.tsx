import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LoadingIndicator, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

const Verifying = () => {
  const { t } = useTranslation('components.pin-verification');

  return (
    <Container>
      <Stack justify="center" width="40px" height="40px">
        <LoadingIndicator />
      </Stack>
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
