import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Portal } from 'ui';

import NavigationBackButton from '../navigation-back-button';
import NavigationCloseButton from '../navigation-close-button';

export type NavigationHeaderProps = {
  children?: React.ReactNode;
  button: {
    variant: 'back' | 'close';
    onClick?: () => void;
    confirmClose?: boolean;
  };
};

const NavigationHeader = ({ children, button }: NavigationHeaderProps) => (
  <Portal selector="#navigation-header-portal" removeContent>
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
    margin-bottom: ${theme.spacing[3]}px;
    padding: ${theme.spacing[5]}px 0 ${theme.spacing[3]}px;

    button {
      position: relative;
      left: -${theme.spacing[3]}px;
    }
  `}
`;

export default NavigationHeader;
