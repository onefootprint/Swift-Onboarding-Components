import { useCallback, useEffect, useState } from 'react';

const useContainerHasScroll = (containerId: string) => {
  const [hasScroll, setHasScroll] = useState(false);

  const handleScroll = useCallback(() => {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    setHasScroll(container.scrollTop > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleScroll();
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }
    container.addEventListener('scroll', handleScroll);
  });

  return hasScroll;
};

export default useContainerHasScroll;
