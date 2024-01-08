import { useTranslation } from '@onefootprint/hooks';
import { LinkButton, Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import useDesktopMachine from '../../../../../hooks/desktop/use-desktop-machine';

const ContinueOnDesktop = () => {
  const { t } = useTranslation('pages.transfer.desktop.qr-register');
  const [state, send] = useDesktopMachine();
  const {
    missingRequirements: { idDoc },
  } = state.context;

  const handleContinueOnDesktop = () => {
    if (idDoc) {
      // If the missing requirements include ID doc, show a confirmation page
      send({
        type: 'confirmationRequired',
      });
      return;
    }

    send({
      type: 'continueOnDesktop',
    });
  };

  return (
    <Container align="center" justify="center" gap={3}>
      <Typography variant="body-3" color="tertiary">
        {t('continue-on-desktop.title')}
      </Typography>
      <LinkButton onClick={handleContinueOnDesktop} size="compact">
        {t('continue-on-desktop.cta')}
      </LinkButton>
    </Container>
  );
};

const Container = styled(Stack)`
  width: 100%;
`;

export default ContinueOnDesktop;
