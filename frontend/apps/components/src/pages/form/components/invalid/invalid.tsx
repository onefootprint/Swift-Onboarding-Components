import { IcoClose24 } from '@onefootprint/icons';
import { IconButton, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Container from '../container';

type InvalidProps = {
  onClose?: () => void;
};

const Invalid = ({ onClose }: InvalidProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form',
  });

  return (
    <Container
      testID="invalid-form"
      header={
        onClose && (
          <CloseButton>
            <IconButton aria-label={t('form-dialog.header.close-aria-label')} onClick={onClose}>
              <IcoClose24 />
            </IconButton>
          </CloseButton>
        )
      }
    >
      <Text tag="h2" color="primary" variant="heading-3" textAlign="center">
        {t('invalid.title')}
      </Text>
      <Text variant="body-2" color="secondary" tag="h3" marginTop={3} marginBottom={7} textAlign="center">
        {t('invalid.subtitle')}
      </Text>
    </Container>
  );
};

const CloseButton = styled.div`
  ${({ theme }) => css`
    position: absolute;
    left: ${theme.spacing[3]};
  `}
`;

export default Invalid;
