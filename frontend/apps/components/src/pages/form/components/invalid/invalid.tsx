import { useTranslation } from '@onefootprint/hooks';
import { IcoClose24 } from '@onefootprint/icons';
import styled from '@onefootprint/styled';
import { IconButton, Typography } from '@onefootprint/ui';
import React from 'react';

import Container from '../container';

type InvalidProps = {
  onClose?: () => void;
};

const Invalid = ({ onClose }: InvalidProps) => {
  const { t } = useTranslation('pages.secure-form.invalid');

  return (
    <Container
      header={
        onClose && (
          <CloseButton>
            <IconButton aria-label={t('close-aria-label')} onClick={onClose}>
              <IcoClose24 />
            </IconButton>
          </CloseButton>
        )
      }
    >
      <Typography as="h2" color="primary" variant="heading-3">
        {t('title')}
      </Typography>
      <Typography
        variant="body-2"
        color="secondary"
        as="h3"
        sx={{ marginTop: 3, marginBottom: 7 }}
      >
        {t('subtitle')}
      </Typography>
    </Container>
  );
};

const CloseButton = styled.div`
  position: absolute;
  left: 0;
`;

export default Invalid;
