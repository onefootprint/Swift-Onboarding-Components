import defer from 'lodash/defer';
import { RefObject, useCallback, useEffect, useState } from 'react';

let closeTimeout: NodeJS.Timeout | null = null;

const useContentVisibility = (options: {
  animationDuration: number;
  contentRef: RefObject<HTMLDivElement>;
  open: boolean;
}) => {
  const { contentRef, open, animationDuration } = options;
  const [shouldShow, setShow] = useState(open);

  const cancelHideTimeout = useCallback(() => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = null;
    }
  }, []);

  const scheduleToHideContent = useCallback(() => {
    cancelHideTimeout();
    closeTimeout = setTimeout(() => {
      setShow(false);
    }, animationDuration);
  }, [cancelHideTimeout, animationDuration]);

  const showContent = () => {
    setShow(true);
  };

  useEffect(() => {
    if (open) {
      showContent();
    } else {
      scheduleToHideContent();
    }

    defer(() => {
      if (contentRef.current) {
        const nextHeight = open ? contentRef.current.scrollHeight : 0;
        contentRef.current.style.maxHeight = `${nextHeight}px`;
      }
    });

    return () => {
      cancelHideTimeout();
    };
  }, [open, cancelHideTimeout, scheduleToHideContent, contentRef]);

  return shouldShow;
};

export default useContentVisibility;
