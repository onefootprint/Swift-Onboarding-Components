import React from 'react';

import FootprintNavigationHeader from '../../../../components/navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import getCurrentStepFromMissingAttributes from './utils/current-step-from-missing-attributes';

const CollectKybDataNavigationHeader = () => {
  const [state, send] = useCollectKybDataMachine();
  const { missingAttributes } = state.context;
  const value = getCurrentStepFromMissingAttributes(
    missingAttributes,
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
        onClick: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default CollectKybDataNavigationHeader;
