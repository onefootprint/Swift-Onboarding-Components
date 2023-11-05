import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import { useFootprintProvider } from '@onefootprint/idv-elements';
import { useRef } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import type { BifrostProps } from '../../types';

const POST_MESSAGE_TIMEOUT = 1000;

// Waits for props from parent for up to POST_MESSAGE_TIMEOUT or times out
const usePropsFromParent = (
  onSuccess: (props: BifrostProps) => void,
  onTimeout: () => void,
) => {
  const footprintProvider = useFootprintProvider();
  const timerId = useRef<NodeJS.Timeout | undefined>();

  const unsubscribe = footprintProvider.on(
    FootprintPrivateEvent.propsReceived,
    // @ts-expect-error: Argument of type '(data: BifrostProps) => void' is not assignable to parameter
    (data: BifrostProps) => {
      clearTimeout(timerId.current);
      onSuccess(data);
    },
  );

  const handleTimeout = () => {
    unsubscribe();
    onTimeout();
  };

  useEffectOnce(() => {
    footprintProvider.load();

    if (!timerId.current) {
      timerId.current = setTimeout(handleTimeout, POST_MESSAGE_TIMEOUT);
    }

    return () => {
      unsubscribe();
      clearTimeout(timerId.current);
    };
  });
};

export default usePropsFromParent;
