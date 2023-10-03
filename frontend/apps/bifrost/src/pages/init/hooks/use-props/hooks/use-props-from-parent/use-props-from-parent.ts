import { FootprintPrivateEvent } from '@onefootprint/footprint-js';
import {
  LegacyFootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';
import { useEffect, useState } from 'react';
import { useEffectOnce, useTimeout } from 'usehooks-ts';

import type { BifrostProps } from '../../types';
import parseLegacyUserData from '../../utils/parse-legacy-user-data';

// Wait for a bit for post message to arrive before giving up
const POST_MESSAGE_TIMEOUT = 1000;

const usePropsFromParent = (
  onSuccess: (props: BifrostProps) => void,
  onTimeout: () => void,
) => {
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

  const unsubscribe = () => {
    unsubscribeProps();
    unsubscribeLegacyBootstrap();
    unsubscribeLegacyOptions();
  };

  useEffectOnce(() => {
    footprintProvider.load().then(() => {
      setIsLoaded(true);
    });
  });

  useTimeout(() => {
    unsubscribe();

    onTimeout();
  }, POST_MESSAGE_TIMEOUT);

  // If post message doesn't arrive for a while, assume there is no bootstrap data / options
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (props || legacyUserData || legacyOptions) {
      unsubscribe();
      onSuccess?.({
        userData: legacyUserData || props?.userData,
        options: legacyOptions || props?.options,
        l10n: props?.l10n,
      });
    }
  }, [legacyUserData, legacyOptions, props, isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps
};

export default usePropsFromParent;
