import { NavigationHeader } from 'footprint-ui';
import React from 'react';
import { Events } from 'src/utils/state-machine/onboarding';
import { Stepper } from 'ui';

import useOnboardingMachine from '../../hooks/use-onboarding-machine';
import {
  getCurrentStepFromMissingAttributes,
  getMaxStepFromMissingAttributes,
} from './progress-header.utils';

const ProgressHeader = () => {
  const [state, send] = useOnboardingMachine();
  const max = getMaxStepFromMissingAttributes(state.context.missingAttributes);
  const value = getCurrentStepFromMissingAttributes(
    state.context.missingAttributes,
    state.value,
  );
  const shouldShowCloseButton = value === 1;

  const handleBackButtonClick = () => {
    send(Events.navigatedToPrevPage);
  };

  return (
    <NavigationHeader
      button={{
        confirmClose: shouldShowCloseButton,
        onClick: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    >
      <Stepper max={max} value={value} />
    </NavigationHeader>
  );
};

export default ProgressHeader;
