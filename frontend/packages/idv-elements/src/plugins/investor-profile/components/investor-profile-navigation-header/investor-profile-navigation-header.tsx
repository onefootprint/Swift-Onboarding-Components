import React from 'react';

import { NavigationHeader } from '../../../../components';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';

const InvestorProfileNavigationHeader = () => {
  const [state, send] = useInvestorProfileMachine();
  const shouldShowCloseButton = state.matches('employment');

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
  };

  return (
    <NavigationHeader
      button={{
        confirmClose: shouldShowCloseButton,
        onBack: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default InvestorProfileNavigationHeader;
