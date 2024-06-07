import { useState } from 'react';
import { usePopper as useBasePopper } from 'react-popper';

const usePopper = () => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLUListElement | null>();

  const popper = useBasePopper(referenceElement, popperElement, {
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 8] },
      },
    ],
  });
  return {
    popper,
    setReferenceElement,
    setPopperElement,
  };
};

export default usePopper;
