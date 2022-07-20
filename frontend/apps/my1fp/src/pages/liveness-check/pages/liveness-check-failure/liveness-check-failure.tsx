import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const LivenessCheckFailure = () => {
  const { t } = useTranslation('pages.liveness-check.liveness-check-failure');

  return (
    <Container>
      <Typography variant="label-3" color="error">
        {t('description')}
      </Typography>
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
    row-gap: ${theme.spacing[8]}px;
  `}
`;

export default LivenessCheckFailure;
