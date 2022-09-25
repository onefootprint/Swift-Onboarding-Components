import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const LivenessCheckFailure = () => {
  const { t } = useTranslation('pages.liveness-check.liveness-check-failure');

  return (
    <Container>
      <TitleContainer>
        <IcoForbid40 color="error" />
        <Typography variant="heading-3">{t('title')}</Typography>
      </TitleContainer>
      <Typography variant="body-2">{t('description')}</Typography>
    </Container>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]}px;
    justify-content: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]}px;
    height: 156px;
    justify-content: center;
    text-align: center;
  `}
`;

export default LivenessCheckFailure;
