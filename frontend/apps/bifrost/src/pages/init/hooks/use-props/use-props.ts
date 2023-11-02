import { useEffect, useRef, useState } from 'react';

import usePropsFromParent from './hooks/use-props-from-parent';
import usePropsFromParentLegacy from './hooks/use-props-from-parent/use-props-from-parent-legacy';
import usePropsFromUrl from './hooks/use-props-from-url';
import type { BifrostProps } from './types';

/*
On web:
1. For footprint-js < 2.0.0 
Used by fractinonal. Bifrost receives 'bootstrapReceived' with 'email' and 'phoneNumber'.

2. For footprint-js < 3.0.0
Bifrost receives 'bootstrapReceived' and 'optionsReceived' events from footprint-js
where bootstrap data keys are IdDIs.

3. As of footprint-js > 3.0.0
Bifrost receives 'propsReceived' event from footprint-js where props are userData and options.
userData keys are IdDIs.

3. As of footprint-js > 3.5.0
Bifrost receives l10n as part of the propsReceived event.

4. As of footprint-js > 3.7.0
Bifrost receives authToken as part of the propsReceived event.

On mobile:
1. For versions < 2.0.0
The args are passed in the URL fragment: <URL_BASE>#<ENCODED_USER_DATA>
where ENCODED_USER_DATA keys are IdDIs

2. For versions > 2.0.0
The args are passed in the URL fragment: <URL_BASE>#<ENCODED_USER_DATA>__<ENCODED_OPTIONS>__<ENCODED_LOCALE>
where ENCODED_USER_DATA keys are IdDIs
*/

const useProps = (onSuccess: (props: BifrostProps) => void) => {
  const onSuccessCalled = useRef(false); // Whether on success has been called with props
  // We need all 3 of the hooks below to have resolved before we can move on
  const [timeoutCounter, setTimeoutCounter] = useState(0);
  const incrementTimeoutCounter = () => {
    setTimeoutCounter(currCounter => currCounter + 1);
  };

  const complete = (props: BifrostProps) => {
    // If already received props, ignore
    if (onSuccessCalled.current) {
      return;
    }
    onSuccessCalled.current = true;
    onSuccess(props);
  };

  // For react-native / expo SDKs that only pass args via the URL
  usePropsFromUrl((props?: BifrostProps) => {
    if (props) {
      complete(props);
    } else {
      // Meaning we didn't find any params in the url - treat this as a "timeout"
      incrementTimeoutCounter();
    }
  });

  // For new versions of web SDKs
  usePropsFromParent(complete, () => {
    incrementTimeoutCounter();
  });
  // For older versions of web SDKs
  usePropsFromParentLegacy(complete, () => {
    incrementTimeoutCounter();
  });

  useEffect(() => {
    // If all 3 hooks timed out, we should return with empty props
    if (timeoutCounter < 3) {
      return;
    }
    complete({});
  }, [timeoutCounter]);
};

export default useProps;
