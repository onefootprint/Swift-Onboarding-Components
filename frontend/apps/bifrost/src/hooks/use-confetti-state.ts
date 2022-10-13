import { useState } from 'react';
import { useTimeout } from 'usehooks-ts';

const ANIMATION_DELAY = 0;
const ANIMATION_DURATION = 5000;

export const CONFETTI_CONTAINER_ID = 'footprint-confetti-container';

const useConfettiState = () => {
  const [state, setState] = useState<{
    height: number | undefined;
    running: boolean;
    width: number | undefined;
  }>({
    height: undefined,
    running: true,
    width: undefined,
  });

  const setSize = () => {
    const container = document.getElementById(CONFETTI_CONTAINER_ID);
    setState(currentState => ({
      ...currentState,
      height: container?.offsetHeight,
      width: container?.offsetWidth,
    }));
  };

  const stopAnimation = () => {
    setState(currentState => ({
      ...currentState,
      running: false,
    }));
  };

  useTimeout(setSize, ANIMATION_DELAY);
  useTimeout(stopAnimation, ANIMATION_DURATION);

  return state;
};

export default useConfettiState;
