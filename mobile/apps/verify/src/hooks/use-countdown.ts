import { useEffect, useState } from 'react';

let interval: ReturnType<typeof setTimeout> | null = null;
const MILLISECONDS_IN_SECOND = 1000;

const useCountdown = (
  options: {
    disabled?: boolean;
    onCompleted?: () => void;
  } = {},
) => {
  const { disabled, onCompleted } = options;
  const [countdown, setCountdown] = useState(0);

  const startCounter = (seconds: number) => {
    if (disabled || seconds <= 0) {
      return;
    }
    setCountdown(seconds);
    clearCounter();
    interval = setInterval(() => {
      setCountdown(current => Math.max(0, current - 1));
    }, MILLISECONDS_IN_SECOND);
  };

  const clearCounter = () => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  };

  useEffect(
    () => () => {
      clearCounter();
    },
    [],
  );

  useEffect(() => {
    if (disabled) {
      return;
    }
    if (countdown <= 0 && interval) {
      onCompleted?.();
      clearCounter();
    }
  }, [countdown, disabled]);

  const setSeconds = (seconds: number) => {
    startCounter(seconds);
  };

  const setDate = (date: Date) => {
    const dateDiff = date.getTime() - new Date().getTime();
    const seconds = Math.ceil(dateDiff / MILLISECONDS_IN_SECOND);
    startCounter(seconds);
  };

  return { setSeconds, setDate, countdown };
};

export default useCountdown;
