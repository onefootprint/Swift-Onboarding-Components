import { useEffect, useState } from 'react';

const ANIMATION_DURATION = 2000;

let timeout: ReturnType<typeof setTimeout>;
let startedTime: number;

const useTrackAnimationDuration = () => {
  const [isFinished, setFinished] = useState(false);

  useEffect(() => {
    startedTime = window.performance.now();
    timeout = setTimeout(() => {
      setFinished(true);
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const getRemainingDuration = () => {
    const now = window.performance.now();
    const diff = now - startedTime;
    return ANIMATION_DURATION - diff;
  };

  return { isFinished, getRemainingDuration };
};

export default useTrackAnimationDuration;
