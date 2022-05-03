import { useRef } from 'react';

const usePinInputRefs = () => {
  const pinInputRefs = useRef<HTMLInputElement[]>([]);

  const previous = (referenceIndex: number): HTMLInputElement | null =>
    pinInputRefs.current[referenceIndex - 1];

  const next = (referenceIndex: number): HTMLInputElement | null =>
    pinInputRefs.current[referenceIndex + 1];

  const add = (ref: HTMLInputElement | null) => {
    if (!ref) return;
    pinInputRefs.current.push(ref);
  };

  return { add, previous, next };
};

export default usePinInputRefs;
