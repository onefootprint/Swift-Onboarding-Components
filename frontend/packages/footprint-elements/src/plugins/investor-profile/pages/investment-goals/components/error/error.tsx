import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Error = () => {
  const { t } = useTranslation('pages.investment-goals.form');

  return (
    <Container>
      <IcoWarning16 color="error" />
      <Typography variant="body-3" color="error">
        {t('empty-selection')}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `}
`;

export default Error;
