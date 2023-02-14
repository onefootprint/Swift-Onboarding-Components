import { Box, media, Portal } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import NavigationBackButton from './components/navigation-back-button';
import NavigationCloseButton from './components/navigation-close-button';
import { NAVIGATION_HEADER_PORTAL_SELECTOR } from './constants';

export type NavigationHeaderProps = {
  children?: React.ReactNode;
  button: {
    variant: 'back' | 'close';
    onClick?: () => void;
    confirmClose?: boolean;
  };
};

const NavigationHeader = ({ children, button }: NavigationHeaderProps) => (
  <Portal selector={NAVIGATION_HEADER_PORTAL_SELECTOR} removeContent>
    <Container>
      <Box>
        {button.variant === 'close' && (
          <NavigationCloseButton
            confirm={button.confirmClose}
            onClick={button.onClick}
          />
        )}
        {button.variant === 'back' && (
          <NavigationBackButton onClick={button.onClick} />
        )}
      </Box>
      <Box sx={{ justifySelf: 'center' }}>{children}</Box>
    </Container>
  </Portal>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    padding: ${theme.spacing[5]} 0;

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]} 0;
    `}
  `}
`;

export default NavigationHeader;
