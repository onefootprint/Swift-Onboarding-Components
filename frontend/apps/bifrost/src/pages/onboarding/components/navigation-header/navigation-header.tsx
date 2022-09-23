import { NavigationHeader as FootprintNavigationHeader } from 'footprint-elements';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import getCurrentStepFromMissingAttributes from './navigation-header.utils';

const NavigationHeader = () => {
  const [state, send] = useOnboardingMachine();
  const value = getCurrentStepFromMissingAttributes(
    state.context.missingAttributes,
    state.value,
  );
  const shouldShowCloseButton = value === 1;

  const handleBackButtonClick = () => {
    send(Events.navigatedToPrevPage);
  };

  return (
    <FootprintNavigationHeader
      button={{
        confirmClose: shouldShowCloseButton,
        onClick: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default NavigationHeader;
