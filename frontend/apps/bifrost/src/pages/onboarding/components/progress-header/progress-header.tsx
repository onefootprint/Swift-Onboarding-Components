import IcoArrowLeftSmall24 from 'icons/ico/ico-arrow-left-small-24';
import React from 'react';
import CloseButton from 'src/components/close-button';
import { Events } from 'src/utils/state-machine/onboarding';
import styled from 'styled-components';
import { IconButton, Portal, ProgressIndicator } from 'ui';

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
    <Portal selector="#main-header" removeContent>
      {shouldShowCloseButton ? (
        <CloseButton />
      ) : (
        <IconButton
          iconComponent={IcoArrowLeftSmall24}
          ariaLabel="Previous window"
          onClick={handleBackButtonClick}
        />
      )}
      <ProgressIndicatorContainer>
        <ProgressIndicator max={max} value={value} />
      </ProgressIndicatorContainer>
    </Portal>
  );
};

const ProgressIndicatorContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  margin-left: -32px; // Icon size
`;

export default ProgressHeader;
