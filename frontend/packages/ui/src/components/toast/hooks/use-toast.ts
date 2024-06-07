'use client';

import { useState } from 'react';

import type { NextToast, ToastProps } from '../toast.types';

const HIDE_TIMEOUT = 8000;
const LEAVING_ANIMATION_DURATION = 200;

const timeoutManager: Record<string, ReturnType<typeof setTimeout>> = {};

const createRandomId = () => Math.random().toString(36).substring(2, 15);

const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const show = (nextToast: NextToast, hideTimeout = HIDE_TIMEOUT) => {
    const id = createRandomId();
    setToasts(currentToasts => [...currentToasts, { ...nextToast, id, leaving: false }]);
    scheduleToHide(id, hideTimeout);
    return id;
  };

  const hide = (id: string) => {
    clearTimeout(timeoutManager[id]);
    const delay = 0;
    scheduleToHide(id, delay);
  };

  const scheduleToHide = (id: string, delay = HIDE_TIMEOUT) => {
    timeoutManager[id] = setTimeout(() => {
      showAnimationBeforeHide(id);
      setTimeout(() => {
        removeFromDom(id);
      }, LEAVING_ANIMATION_DURATION);
    }, delay);
  };

  const showAnimationBeforeHide = (id: string) => {
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

  return { toasts, show, hide };
};

export default useToast;
