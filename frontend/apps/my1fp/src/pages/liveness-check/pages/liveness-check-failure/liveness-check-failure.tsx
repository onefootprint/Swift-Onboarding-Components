import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

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
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    height: 156px;
    justify-content: center;
    text-align: center;
  `}
`;

export default LivenessCheckFailure;
