import { useEffect, useState } from 'react';

const showEvents = ['mouseenter', 'focus'];
const hideEvents = ['mouseleave', 'blur'];

const useVisibility = (refElement: HTMLElement | null) => {
  const [isVisible, setVisibility] = useState(false);

  const show = () => {
    setVisibility(true);
  };

  const hide = () => {
    setVisibility(false);
  };

  useEffect(() => {
    showEvents.forEach(event => {
      refElement?.addEventListener(event, show);
    });
    hideEvents.forEach(event => {
      refElement?.addEventListener(event, hide);
    });

    return () => {
      showEvents.forEach(event => {
        refElement?.removeEventListener(event, show);
      });
      hideEvents.forEach(event => {
        refElement?.removeEventListener(event, hide);
      });
    };
  }, [refElement]);

  return isVisible;
};

export default useVisibility;
