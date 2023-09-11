import type { MutableRefObject } from 'react';
import { createRef, useEffect, useState } from 'react';

const usePinInputRefs = (pinInputCount: number) => {
  const [refs, setRefs] = useState<MutableRefObject<HTMLInputElement>[]>([]);

  const previous = (
    referenceIndex: number,
  ): HTMLInputElement | null | undefined => refs[referenceIndex - 1]?.current;

  const next = (referenceIndex: number): HTMLInputElement | null | undefined =>
    refs[referenceIndex + 1]?.current;

  useEffect(() => {
    setRefs(elRefs =>
      Array(pinInputCount)
        .fill('')
        .map((_, i) => elRefs[i] || createRef()),
    );
  }, [pinInputCount]);

  return { refs, previous, next };
};

export default usePinInputRefs;
