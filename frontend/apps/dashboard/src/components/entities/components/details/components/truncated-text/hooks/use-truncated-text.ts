import { useEffect, useRef, useState } from 'react';

export enum ShownTextState {
  FULL_WITHIN_MAX_HEIGHT = 'full text within max height',
  FULL_EXCEEDS_MAX_HEIGHT = 'full text excedding max height',
  PARTIAL_WITHIN_MAX_HEIGHT = 'partial text within max height',
}

const OFFSET_FOR_SEE_MORE_BUTTON = 30;

const useTruncatedtext = (text: string, maxTextViewHeight: number) => {
  const textContainerRef = useRef(null);
  const [currShownText, setCurrShownText] = useState(text);
  const [shownTextState, setShownTextLength] = useState(ShownTextState.FULL_WITHIN_MAX_HEIGHT);

  useEffect(() => {
    const calculateTruncatedText = () => {
      const { current: noteTextContainer } = textContainerRef;
      if (!noteTextContainer) return;

      const { scrollHeight } = noteTextContainer;
      if (scrollHeight > maxTextViewHeight) {
        const appxTextLength = (maxTextViewHeight / scrollHeight) * currShownText.length;
        setCurrShownText(prevText => `${prevText.substring(0, appxTextLength - OFFSET_FOR_SEE_MORE_BUTTON).trim()}...`);
        setShownTextLength(ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT);
      }
    };
    if (
      shownTextState === ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT ||
      shownTextState === ShownTextState.FULL_WITHIN_MAX_HEIGHT
    )
      calculateTruncatedText();
  }, [shownTextState, currShownText.length, maxTextViewHeight]);

  const showMoreOrLessText = () => {
    if (shownTextState === ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT) {
      setShownTextLength(ShownTextState.FULL_EXCEEDS_MAX_HEIGHT);
      setCurrShownText(text);
    } else {
      setShownTextLength(ShownTextState.PARTIAL_WITHIN_MAX_HEIGHT);
    }
  };

  return {
    textContainerRef,
    shownTextState,
    currShownText,
    showMoreOrLessText,
  };
};

export default useTruncatedtext;
