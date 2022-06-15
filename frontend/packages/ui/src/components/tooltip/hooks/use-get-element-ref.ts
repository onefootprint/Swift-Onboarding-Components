import React, { cloneElement } from 'react';

const useGetElementRef = (
  element: React.ReactElement,
  id: string,
  onRef: (ref: HTMLElement) => void,
) => {
  const handleRef = (ref: HTMLElement | null) => {
    if (ref) {
      ref.setAttribute('aria-describedby', id);
      onRef(ref);
    }
  };
  // clone is required in order to access the element ref
  // which could be anything in this case
  return cloneElement(element, {
    ref: handleRef,
  });
};

export default useGetElementRef;
