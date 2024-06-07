import { useEffect, useState } from 'react';

let timeout: NodeJS.Timeout | null = null;
const TIMEOUT_DURATION = 5000;

const useCarouselIndex = (slidesCount: number) => {
  const [index, setSliderIndex] = useState(0);
  const firstIndex = 0;
  const lastIndex = slidesCount - 1;
  const previousIndex = index === firstIndex ? lastIndex : index - 1;
  const nextIndex = index === lastIndex ? firstIndex : index + 1;

  const goToIndex = (selectedIndex: number) => {
    setSliderIndex(selectedIndex);
  };

  const goBack = () => {
    setSliderIndex(currentIndex => {
      if (currentIndex === firstIndex) return lastIndex;
      return currentIndex - 1;
    });
  };

  const goForward = () => {
    setSliderIndex(currentIndex => {
      if (currentIndex === lastIndex) return firstIndex;
      return currentIndex + 1;
    });
  };

  const startSlideTimeout = () => {
    timeout = setTimeout(() => {
      requestAnimationFrame(startSlideTimeout);
      goForward();
    }, TIMEOUT_DURATION);
  };

  const resetSlideTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  const resetAndStartTimeout = (callback: (params: number) => void) => (params: number) => {
    resetSlideTimeout();
    startSlideTimeout();
    callback(params);
  };

  useEffect(() => {
    startSlideTimeout();
    return () => {
      resetSlideTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    firstIndex,
    goBack: resetAndStartTimeout(goBack),
    goForward: resetAndStartTimeout(goForward),
    goToIndex: resetAndStartTimeout(goToIndex),
    index,
    lastIndex,
    nextIndex,
    previousIndex,
  };
};

export default useCarouselIndex;
