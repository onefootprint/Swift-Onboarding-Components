import React from 'react';
import CloseButton from 'src/components/close-button';
import PrevButton from 'src/components/prev-button';
import { Events } from 'src/utils/state-machine/onboarding';
import styled from 'styled-components';
import { Portal, Stepper } from 'ui';

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
        <PrevButton onClick={handleBackButtonClick} />
      )}
      <StepperContainer>
        <Stepper max={max} value={value} />
      </StepperContainer>
    </Portal>
  );
};

const StepperContainer = styled.div`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  margin-left: -32px; // Icon size
`;

export default ProgressHeader;
