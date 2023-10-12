import React from 'react';

import { NavigationHeader as FootprintNavigationHeader } from '../../../../components';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import getCurrentStepFromMissingAttributes from './utils/current-step-from-missing-attributes';

const NavigationHeader = () => {
  const [state, send] = useCollectKycDataMachine();
  const { requirement, initialData } = state.context;
  const value = getCurrentStepFromMissingAttributes(
    requirement,
    initialData,
    state.value,
  );
  const shouldShowCloseButton = value === 1;

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
  };

  return (
    <FootprintNavigationHeader
      leftButton={{
        confirmClose: shouldShowCloseButton,
        onBack: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default NavigationHeader;
