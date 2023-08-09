import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import {
  LegacyFootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdvBootstrapData, IdvOptions } from '@onefootprint/types';
import { useEffect, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import { BifrostProps } from '../../types';
import parseLegacyUserData from '../../utils/parse-legacy-user-data';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 500;

const usePropsFromParent = (onSuccess: (props: BifrostProps) => void) => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const footprintProvider = useFootprintProvider();

  const [props, setProps] = useState<BifrostProps | undefined>();
  const [legacyUserData, setLegacyUserData] = useState<
    IdvBootstrapData | undefined
  >();
  const [legacyOptions, setLegacyOptions] = useState<IdvOptions | undefined>();

  const unsubscribeProps = footprintProvider.on(
    FootprintPrivateEvent.propsReceived,
    (data: BifrostProps) => {
      setProps(data);
    },
  );

  const unsubscribeLegacyBootstrap = footprintProvider.on(
    LegacyFootprintInternalEvent.bootstrapDataReceived,
    (data: IdvBootstrapData) => {
      const parsed = parseLegacyUserData(data);
      setLegacyUserData(parsed);
    },
  );

  const unsubscribeLegacyOptions = footprintProvider.on(
    LegacyFootprintInternalEvent.optionsReceived,
    (data: IdvOptions) => {
      setLegacyOptions(data);
    },
  );

  const clearTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const complete = () => {
    unsubscribeProps();
    unsubscribeLegacyBootstrap();
    unsubscribeLegacyOptions();

    if (!props && !legacyUserData && !legacyOptions) {
      onSuccess?.({});
    }
    const data = {
      userData: legacyUserData || props?.userData,
      options: legacyOptions || props?.options,
    };
    onSuccess?.(data);
  };

  useEffectOnce(() => {
    footprintProvider.load().then(() => {
      setIsLoaded(true);
    });
  });

  // If post message doesn't arrive for a while, assume there is no bootstrap data / options
  useEffect(() => {
    const timerId = setTimeout(() => {
      complete();
    }, POST_MESSAGE_TIMEOUT);
    setTimeoutId(timerId);

    return clearTimer;
  }, [legacyUserData, legacyOptions, props, isLoaded]);
};

export default usePropsFromParent;
