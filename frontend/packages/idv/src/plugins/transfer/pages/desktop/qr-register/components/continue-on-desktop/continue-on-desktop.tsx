import { LinkButton, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useDesktopMachine from '../../../../../hooks/desktop/use-desktop-machine';

const ContinueOnDesktop = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.pages.desktop.qr-register',
  });
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
      <Text variant="body-3" color="tertiary">
        {t('continue-on-desktop.title')}
      </Text>
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
