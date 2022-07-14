import { useEffect, useState } from 'react';

let interval: NodeJS.Timer | null = null;
const ONE_SECOND = 1000;
const INITIAL_COUNTER = 3;

const useCountdown = (options: {
  disabled?: boolean;
  onCompleted: () => void;
}) => {
  const { disabled, onCompleted } = options;
  const [countdown, setCountdown] = useState(INITIAL_COUNTER);

  const startCounter = () => {
    interval = setInterval(() => {
      setCountdown(current => current - 1);
    }, ONE_SECOND);
  };

  const clearCounter = () => {
    if (interval) {
      clearInterval(interval);
    }
  };

  useEffect(
    () => () => {
      clearCounter();
    },
    [],
  );

  useEffect(() => {
    if (!disabled) {
      return;
    }
    if (countdown === INITIAL_COUNTER) {
      startCounter();
    }
    if (countdown === 0) {
      onCompleted();
      clearCounter();
    }
  }, [disabled, countdown, onCompleted]);

  return countdown;
};

export default useCountdown;
