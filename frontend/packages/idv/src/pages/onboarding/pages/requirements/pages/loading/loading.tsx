import { AnimatedLoadingSpinner } from '@onefootprint/ui';
import styled from 'styled-components';
import type { StateValue } from 'xstate';

import { useOnboardingRequirementsMachine } from '../../components/machine-provider';

const isLoadingState = (state: StateValue) => {
  const loadingStates = ['init', 'startOnboarding', 'waitForComponentsSdk', 'checkRequirements', 'router', 'process'];
  return loadingStates.some(s => state === s);
};

const Loading = () => {
  const [state] = useOnboardingRequirementsMachine();
  if (!isLoadingState(state.value)) {
    return null;
  }

  return (
    <Container>
      <AnimatedLoadingSpinner animationStart />
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  flex-direction: column;
  min-height: var(--loading-container-min-height);
  justify-content: center;
  text-align: center;
`;

export default Loading;
