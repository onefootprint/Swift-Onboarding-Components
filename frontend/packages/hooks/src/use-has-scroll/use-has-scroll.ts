import { useCallback, useEffect, useState } from 'react';

const useHasScroll = () => {
  const [hasScroll, setHasScroll] = useState(false);
  const handleScroll = useCallback(() => {
    setHasScroll(window.scrollY > 0);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return hasScroll;
};

export default useHasScroll;
