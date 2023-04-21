import React from 'react';
import styled, { css } from 'styled-components';

import NavigationBackButton from '../navigation-back-button';
import NavigationCloseButton from '../navigation-close-button';

type NavigationButtonContainerProps = {
  button?: {
    variant: 'back' | 'close';
    onClick?: () => void;
    confirmClose?: boolean;
  };
};

const NavigationButtonContainer = ({
  button,
}: NavigationButtonContainerProps) =>
  button ? (
    <Container>
      {button.variant === 'close' && (
        <NavigationCloseButton
          confirm={button.confirmClose}
          onClick={button.onClick}
        />
      )}
      {button.variant === 'back' && (
        <NavigationBackButton onClick={button.onClick} />
      )}
    </Container>
  ) : null;

const Container = styled.div`
  ${({ theme }) => css`
    position: absolute;
    top: ${theme.spacing[5]};
    left: 0;
  `}
`;

export default NavigationButtonContainer;
