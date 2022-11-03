import { useState } from 'react';
import { usePopper as useBasePopper } from 'react-popper';

const usePopper = () => {
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>(
    null,
  );
  const popper = useBasePopper(referenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [0, 4] } }],
  });

  return {
    popper,
    setReferenceElement,
    setPopperElement,
  };
};

export default usePopper;
