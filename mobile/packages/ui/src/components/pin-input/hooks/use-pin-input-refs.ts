import { createRef, MutableRefObject, useEffect, useState } from 'react';
import { TextInput } from 'react-native';

const usePinInputRefs = (pinInputCount: number) => {
  const [refs, setRefs] = useState<MutableRefObject<TextInput>[]>([]);

  const previous = (referenceIndex: number): TextInput | null | undefined =>
    refs[referenceIndex - 1]?.current;

  const next = (referenceIndex: number): TextInput | null | undefined =>
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
