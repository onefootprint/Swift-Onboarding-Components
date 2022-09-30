import React from 'react';

import FootprintNavigationHeader from '../../../../components/navigation-header';
import { Events, States } from '../../utils/state-machine/types';
import { useCollectKycDataMachine } from '../machine-provider';
import getCurrentStepFromMissingAttributes from './utils/current-step-from-missing-attributes';

const NavigationHeader = () => {
  const [state, send] = useCollectKycDataMachine();
  const value = getCurrentStepFromMissingAttributes(
    state.context.missingAttributes,
    state.value as States,
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
