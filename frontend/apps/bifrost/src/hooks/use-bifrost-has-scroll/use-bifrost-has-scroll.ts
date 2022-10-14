import { useCallback, useEffect, useState } from 'react';

import { BIFROST_CONTAINER_ID } from '../../components/content-with-header-and-footer';

const useBifrostHasScroll = () => {
  const [hasScroll, setHasScroll] = useState(false);

  const handleScroll = useCallback(() => {
    const container = document.getElementById(BIFROST_CONTAINER_ID);
    if (!container) {
      return;
    }
    setHasScroll(container.scrollTop > 0);
  }, []);

  useEffect(() => {
    handleScroll();
    const container = document.getElementById(BIFROST_CONTAINER_ID);
    container?.addEventListener('scroll', handleScroll);
  });

  return hasScroll;
};

export default useBifrostHasScroll;
