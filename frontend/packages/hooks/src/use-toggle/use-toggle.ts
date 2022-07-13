import { useCallback, useState } from 'react';

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggleOn = useCallback(() => setValue(true), []);
  const toggleOff = useCallback(() => setValue(false), []);
  return [value, toggleOn, toggleOff] as const;
};

export default useToggle;
