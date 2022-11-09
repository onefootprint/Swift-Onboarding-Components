import React from 'react';

import FootprintNavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine, {
  Events,
  States,
} from '../../hooks/use-collect-kyc-data-machine';
import getCurrentStepFromMissingAttributes from './utils/current-step-from-missing-attributes';

const NavigationHeader = () => {
  const [state, send] = useCollectKycDataMachine();
  const { missingAttributes } = state.context;
  const value = getCurrentStepFromMissingAttributes(
    missingAttributes,
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
