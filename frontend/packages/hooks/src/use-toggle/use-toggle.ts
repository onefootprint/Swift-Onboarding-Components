import { useState } from 'react';

const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggleOn = () => setValue(true);
  const toggleOff = () => setValue(false);
  return [value, toggleOn, toggleOff];
};

export default useToggle;
