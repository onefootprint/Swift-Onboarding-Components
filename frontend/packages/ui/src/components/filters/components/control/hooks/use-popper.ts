import { useState } from 'react';
import { usePopper as useBasePopper } from 'react-popper';

const usePopper = () => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>();
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>();
  const popper = useBasePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
    ],
  });

  return {
    attributes: popper.attributes,
    styles: popper.styles,
    setReferenceElement,
    setPopperElement,
  };
};

export default usePopper;
