import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import { IconButton } from '@onefootprint/ui';
import React from 'react';

export type NavigationBackButtonProps = {
  onClick?: () => void;
};

const NavigationBackButton = ({ onClick }: NavigationBackButtonProps) => (
  <IconButton aria-label="Go back" onClick={onClick}>
    <IcoChevronLeftBig24 />
  </IconButton>
);

export default NavigationBackButton;
