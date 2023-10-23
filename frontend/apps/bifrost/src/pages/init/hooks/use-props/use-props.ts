import { Logger } from '@onefootprint/idv-elements';
import { useEffect, useState } from 'react';

import usePropsFromParent from './hooks/use-props-from-parent';
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
  const [providerProps, setProviderProps] = useState<
    BifrostProps | undefined
  >();
  const [urlProps, setUrlProps] = useState<BifrostProps | undefined>();

  usePropsFromUrl((props: BifrostProps) => {
    if (!urlProps) {
      setUrlProps(props);
    }
  });

  const handlePropsFromParent = (props: BifrostProps) => {
    if (!providerProps) {
      setProviderProps(props);
    }
  };
  const handleTimeout = () => {
    if (!urlProps) {
      Logger.warn(
        'Getting props from url timed out on bifrost while the url prop is also empty.',
        'birost-use-props',
      );
      console.warn(
        'Getting provider prop from parent iFrame timed out on bifrost while the url prop is also empty.',
      );
    }
    setProviderProps({
      userData: {},
      options: {},
      l10n: {},
      authToken: '',
    });
  };
  usePropsFromParent(handlePropsFromParent, handleTimeout);

  useEffect(() => {
    if (!urlProps || !providerProps) {
      return;
    }

    if (urlProps && Object.keys(urlProps).length > 0) {
      onSuccess(urlProps);
      return;
    }
    if (providerProps && Object.keys(providerProps).length > 0) {
      onSuccess(providerProps);
      return;
    }
    onSuccess({} as BifrostProps);
  }, [urlProps, providerProps]); // eslint-disable-line react-hooks/exhaustive-deps

  return providerProps;
};

export default useProps;
