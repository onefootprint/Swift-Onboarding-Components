import { useEffect, useState } from 'react';

import haptic from '@/utils/haptic';

const COUNTDOWN_SECONDS = 4;
const TICK_INTERVAL = 850;
const NOT_DETECTED_TOLERANCE = 300;

let timerId: NodeJS.Timeout = null;
let notDetectedTimerId: NodeJS.Timeout = null;

const useCameraCountdown = (object: any, onDone: () => void) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const reset = () => {
    setCountdown(COUNTDOWN_SECONDS);
    clearInterval(timerId);
    timerId = null;
    resetNotDetected();
  };

  const resetNotDetected = () => {
    clearInterval(notDetectedTimerId);
    notDetectedTimerId = null;
  };

  const start = () => {
    timerId = setInterval(() => handleTick(), TICK_INTERVAL);
  };

  const handleTick = () => {
    setCountdown(prev => {
      if (prev === 1) {
        onDone();
        reset();
        return;
      }
      return prev - 1;
    });
    haptic.trigger('impactHeavy');
  };

  const handleNotDetected = () => {
    notDetectedTimerId = setTimeout(() => {
      reset();
    }, NOT_DETECTED_TOLERANCE);
  };

  useEffect(() => {
    if (object.isDetected) {
      if (timerId == null) {
        start();
      } else {
        resetNotDetected();
      }
    } else {
      if (timerId) {
        handleNotDetected();
      }
    }
  }, [object.isDetected]);

  return {
    countdown: timerId ? countdown : null,
    reset,
  };
};

export default useCameraCountdown;
