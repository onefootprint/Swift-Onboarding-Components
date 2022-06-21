import { useState } from 'react';

import { NextToast, ToastProps } from '../toast.types';

const CLOSE_TIMEOUT = 8000;
const LEAVING_ANIMATION_DURATION = 200;

const timeoutManager: Record<string, NodeJS.Timeout> = {};

const createRandomId = () => Math.random().toString(36).substring(2, 15);

const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const open = (nextToast: NextToast) => {
    const id = createRandomId();
    setToasts(currentToasts => [
      ...currentToasts,
      { ...nextToast, id, leaving: false },
    ]);
    scheduleToClose(id);
    return id;
  };

  const close = (id: string) => {
    clearTimeout(timeoutManager[id]);
    const delay = 0;
    scheduleToClose(id, delay);
  };

  const scheduleToClose = (id: string, delay = CLOSE_TIMEOUT) => {
    timeoutManager[id] = setTimeout(() => {
      showAnimationBeforeClose(id);
      setTimeout(() => {
        removeFromDom(id);
      }, LEAVING_ANIMATION_DURATION);
    }, delay);
  };

  const showAnimationBeforeClose = (id: string) => {
    setToasts(currentToasts =>
      currentToasts.map(toast => {
        if (toast.id === id) {
          return {
            ...toast,
            leaving: true,
          };
        }
        return toast;
      }),
    );
  };

  const removeFromDom = (id: string) => {
    setToasts(currentToast => currentToast.filter(toast => toast.id !== id));
    delete timeoutManager[id];
  };

  return { toasts, open, close };
};

export default useToast;
