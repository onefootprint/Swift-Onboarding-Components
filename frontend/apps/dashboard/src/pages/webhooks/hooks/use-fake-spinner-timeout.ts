import { useState } from 'react';
import { useTimeout } from 'usehooks-ts';

const DELAY = 4000;

const useFakeSpinnerTimeout = () => {
  const [show, setShow] = useState(true);

  useTimeout(() => {
    setShow(false);
  }, DELAY);

  return show;
};

export default useFakeSpinnerTimeout;
