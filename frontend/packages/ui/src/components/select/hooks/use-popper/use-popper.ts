import { useState } from 'react';
import { usePopper as useBasePopper } from 'react-popper';
import { useTheme } from 'styled';

const usePopper = () => {
  const theme = useTheme();
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const popper = useBasePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [0, theme.spacing[3]] } }],
  });

  return {
    popper,
    setReferenceElement,
    setPopperElement,
  };
};

export default usePopper;
