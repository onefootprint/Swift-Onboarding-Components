import { useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import { BIFROST_CONTAINER_ID } from '../components/content-with-header-and-footer';

const ANIMATION_DELAY = 0;
const ANIMATION_DURATION = 5000;

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
    const container = document.getElementById(BIFROST_CONTAINER_ID);
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
