import { IcoChevronLeftBig24 } from '@onefootprint/icons';
import React from 'react';
import { IconButton } from 'ui';

export type NavigationBackButtonProps = {
  onClick?: () => void;
};

const NavigationBackButton = ({ onClick }: NavigationBackButtonProps) => (
  <IconButton
    aria-label="Go back"
    iconComponent={IcoChevronLeftBig24}
    onClick={onClick}
  />
);

export default NavigationBackButton;
