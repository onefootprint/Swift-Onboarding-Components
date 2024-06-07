import { IcoForbid40 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { NavigationHeader } from '../../../../components/layout';

const ErrorComponent = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'onboarding.components.error',
  });

  return (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <TitleContainer>
        <IcoForbid40 color="error" />
        <Text variant="heading-3">{t('title')}</Text>
      </TitleContainer>
      <Text variant="body-2" textAlign="center">
        {t('description')}
      </Text>
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

export default ErrorComponent;
