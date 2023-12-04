// Copied from https://github.com/juliencrn/usehooks-ts/blob/master/packages/usehooks-ts/src/useOnClickOutside/useOnClickOutside.ts
import type { RefObject } from 'react';

import useEventListener from '../use-event-listener';

type Handler = (event: MouseEvent) => void;

const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown',
): void => {
  useEventListener(mouseEvent, event => {
    const el = ref?.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event);
  });
};

export default useOnClickOutside;
