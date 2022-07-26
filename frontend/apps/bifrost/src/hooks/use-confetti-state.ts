import { useState } from 'react';
import useTimeoutFn from 'react-use/lib/useTimeoutFn';

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
    const container = document.getElementById('content');
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

  useTimeoutFn(setSize, ANIMATION_DELAY);
  useTimeoutFn(stopAnimation, ANIMATION_DURATION);

  return state;
};

export default useConfettiState;
