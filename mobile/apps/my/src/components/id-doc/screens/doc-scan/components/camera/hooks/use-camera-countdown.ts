import { useEffect, useState } from 'react';

import haptic from '@/utils/haptic';

const COUNTDOWN_SECONDS = 4;
const TICK_INTERVAL = 850;
const NOT_DETECTED_TOLERANCE = 150;

let timerId: ReturnType<typeof setTimeout> | null = null;
let notDetectedTimerId: ReturnType<typeof setTimeout> | null = null;

const useCameraCountdown = (props: {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  object: any;
  disabled?: boolean;
  onDone: () => void;
}) => {
  const { object, disabled, onDone } = props;
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const reset = () => {
    setCountdown(COUNTDOWN_SECONDS);
    if (timerId) {
      clearInterval(timerId);
    }
    timerId = null;
    resetNotDetected();
  };

  const resetNotDetected = () => {
    if (notDetectedTimerId) {
      clearInterval(notDetectedTimerId);
    }
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (disabled) {
      reset();
      return;
    }

    if (object.isDetected) {
      if (timerId == null) {
        start();
      } else {
        resetNotDetected();
      }
    } else if (timerId) {
      handleNotDetected();
    }
  }, [object.isDetected, disabled]);

  return {
    countdown: timerId ? countdown : null,
    reset,
  };
};

export default useCameraCountdown;
