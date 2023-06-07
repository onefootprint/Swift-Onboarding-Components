import { useEffect, useState } from 'react';

const timeToShowManualPhotoButton = 10000;

let timerId: NodeJS.Timeout | null = null;

const useCanTakePhotoManually = () => {
  const [show, setShow] = useState(false);

  const reset = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  const handleTimeout = () => {
    if (show) return;
    setShow(true);
  };

  useEffect(() => {
    timerId = setTimeout(handleTimeout, timeToShowManualPhotoButton);
    return () => {
      reset();
    };
  }, []);

  return [show, reset] as const;
};

export default useCanTakePhotoManually;
