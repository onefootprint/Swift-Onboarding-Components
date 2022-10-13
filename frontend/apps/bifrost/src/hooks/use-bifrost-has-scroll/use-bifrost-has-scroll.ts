import { useCallback, useEffect, useState } from 'react';

export const BIFROST_SCROLLABLE_CONTAINER_ID = 'bifrost-scrollable-container'; // TODO: unify

const useBifrostHasScroll = () => {
  const [hasScroll, setHasScroll] = useState(false);

  const handleScroll = useCallback(() => {
    const container = document.getElementById(BIFROST_SCROLLABLE_CONTAINER_ID);
    if (!container) {
      return;
    }
    setHasScroll(container.scrollTop > 0);
  }, []);

  useEffect(() => {
    handleScroll();
    const container = document.getElementById(BIFROST_SCROLLABLE_CONTAINER_ID);
    container?.addEventListener('scroll', handleScroll);
  });

  return hasScroll;
};

export default useBifrostHasScroll;
