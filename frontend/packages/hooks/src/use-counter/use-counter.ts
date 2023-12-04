// Copied from https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useCounter/useCounter.ts
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

type UseCounterOutput = {
  count: number;
  decrement: () => void;
  increment: () => void;
  reset: () => void;
  setCount: Dispatch<SetStateAction<number>>;
};

export default (initialValue?: number): UseCounterOutput => {
  const [count, setCount] = useState(initialValue || 0);
  const increment = () => setCount(x => x + 1);
  const decrement = () => setCount(x => x - 1);
  const reset = () => setCount(initialValue || 0);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  };
};
