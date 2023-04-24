import React from 'react';

import { NavigationHeader } from '../../../../components';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const CollectKybDataNavigationHeader = () => {
  const [state, send] = useCollectKybDataMachine();
  const shouldShowCloseButton = state.matches('introduction');

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

export default CollectKybDataNavigationHeader;
