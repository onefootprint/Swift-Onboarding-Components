import { createRef, useCallback, useEffect, useMemo, useState } from 'react';

const usePinInputRefs = pinInputCount => {
  const [refs, setRefs] = useState([]);

  const previous = useCallback(referenceIndex => refs[referenceIndex - 1]?.current, [refs]);

  const next = useCallback(referenceIndex => refs[referenceIndex + 1]?.current, [refs]);

  const get = useCallback(referenceIndex => refs[referenceIndex]?.current, [refs]);

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
