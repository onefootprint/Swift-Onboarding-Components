// Copied from https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useBoolean/useBoolean.ts
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';

type UseBooleanOutput = {
  setFalse: () => void;
  setTrue: () => void;
  setValue: Dispatch<SetStateAction<boolean>>;
  toggle: () => void;
  value: boolean;
};

export default (defaultValue?: boolean): UseBooleanOutput => {
  const [value, setValue] = useState(!!defaultValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(x => !x), []);

  return { value, setValue, setTrue, setFalse, toggle };
};
