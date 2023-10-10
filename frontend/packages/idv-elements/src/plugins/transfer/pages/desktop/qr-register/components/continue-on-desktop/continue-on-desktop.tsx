import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

import useDesktopMachine from '../../../../../hooks/desktop/use-desktop-machine';

const ContinueOnDesktop = () => {
  const { t } = useTranslation('pages.desktop.qr-register');
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
    <Container>
      <Typography variant="body-3" color="tertiary">
        {t('continue-on-desktop.title')}
      </Typography>
      <LinkButton onClick={handleContinueOnDesktop} size="compact">
        {t('continue-on-desktop.cta')}
      </LinkButton>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    width: 100%;
    gap: ${theme.spacing[3]};
    align-items: center;
  `}
`;

export default ContinueOnDesktop;
