import type { MutableRefObject } from 'react';
import { createRef, useCallback, useEffect, useMemo, useState } from 'react';

const usePinInputRefs = (pinInputCount: number) => {
  const [refs, setRefs] = useState<MutableRefObject<HTMLInputElement>[]>([]);

  const previous = useCallback(
    (referenceIndex: number): HTMLInputElement | null | undefined => refs[referenceIndex - 1]?.current,
    [refs],
  );

  const next = useCallback(
    (referenceIndex: number): HTMLInputElement | null | undefined => refs[referenceIndex + 1]?.current,
    [refs],
  );

  const get = useCallback(
    (referenceIndex: number): HTMLInputElement | null | undefined => refs[referenceIndex]?.current,
    [refs],
  );

  useEffect(() => {
    setRefs(elRefs =>
      Array(pinInputCount)
        .fill('')
        .map((_, i) => elRefs[i] || createRef()),
    );
  }, [pinInputCount]);

  return useMemo(() => ({ refs, previous, next, get }), [get, next, previous, refs]);
};

export default usePinInputRefs;
