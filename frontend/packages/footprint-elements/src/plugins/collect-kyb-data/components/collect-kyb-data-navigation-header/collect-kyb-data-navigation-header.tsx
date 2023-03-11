import React from 'react';

import FootprintNavigationHeader from '../../../../components/navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const CollectKybDataNavigationHeader = () => {
  const [state, send] = useCollectKybDataMachine();
  const shouldShowCloseButton = state.matches('introduction');

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

export default CollectKybDataNavigationHeader;
