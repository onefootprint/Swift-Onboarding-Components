import { IcoWarning16 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const ErrorComponent = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.errors',
  });

  return (
    <Container>
      <IcoWarning16 color="error" />
      <Text variant="body-3" color="error">
        {t('invalid')}
      </Text>
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

export default ErrorComponent;
