import React from 'react';

import { NavigationHeader as FootprintNavigationHeader } from '../../../../components';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import getCurrentStepFromMissingAttributes from './utils/current-step-from-missing-attributes';

const NavigationHeader = () => {
  const [state, send] = useCollectKycDataMachine();
  const { requirement, initData } = state.context;
  const value = getCurrentStepFromMissingAttributes(
    requirement,
    initData,
    state.value,
  );
  const shouldShowCloseButton = value === 1;

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
  };

  return (
    <FootprintNavigationHeader
      button={{
        confirmClose: shouldShowCloseButton,
        onBack: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default NavigationHeader;
