import { useTranslation } from 'hooks';
import { IcoCheckCircle40 } from 'icons';
import React from 'react';
import styled, { css } from 'styled-components';
import { Typography } from 'ui';

const LivenessCheckSuccess = () => {
  const { t } = useTranslation('pages.liveness-check.liveness-check-success');

  return (
    <Container>
      <TitleContainer>
        <IcoCheckCircle40 color="success" />
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

export default LivenessCheckSuccess;
