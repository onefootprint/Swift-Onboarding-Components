import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeader } from '../../../../components/layout';

const Error = () => {
  const { t } = useTranslation('onboarding.components.error');

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <TitleContainer>
        <IcoForbid40 color="error" />
        <Typography variant="heading-3">{t('title')}</Typography>
      </TitleContainer>
      <Typography sx={{ textAlign: 'center' }} variant="body-2">
        {t('description')}
      </Typography>
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
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    min-height: var(--loading-container-min-height);
  `}
`;

export default Error;
