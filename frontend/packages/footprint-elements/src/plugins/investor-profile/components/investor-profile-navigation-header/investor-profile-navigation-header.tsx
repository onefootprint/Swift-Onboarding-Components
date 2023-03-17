import React from 'react';

import FootprintNavigationHeader from '../../../../components/navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';

const InvestorProfileNavigationHeader = () => {
  const [state, send] = useInvestorProfileMachine();
  const shouldShowCloseButton = state.matches('init');

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
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

export default InvestorProfileNavigationHeader;
