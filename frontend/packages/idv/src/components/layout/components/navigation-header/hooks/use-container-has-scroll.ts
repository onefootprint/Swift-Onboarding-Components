import noop from 'lodash/noop';
import { useCallback, useEffect, useState } from 'react';

const useContainerHasScroll = (containerId: string) => {
  const [hasScroll, setHasScroll] = useState(false);

  const handleScroll = useCallback(() => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    setHasScroll(container.scrollTop > 0);
  }, [containerId]);

  useEffect(() => {
    handleScroll();
    const container = document.getElementById(containerId);
    if (!container) {
      return noop;
    }
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerId, handleScroll]);

  return hasScroll;
};

export default useContainerHasScroll;
