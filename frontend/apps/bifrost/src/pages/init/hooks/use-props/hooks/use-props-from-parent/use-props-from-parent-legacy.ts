import {
  LegacyFootprintInternalEvent,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import type { IdvBootstrapData, IdvOptions } from '@onefootprint/types';
import { useEffect, useRef, useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import type { BifrostProps } from '../../types';
import parseLegacyUserData from '../../utils/parse-user-data';

const POST_MESSAGE_TIMEOUT = 1000;

// TODO: Delete when Fractional migrates over
// Waits for props from parent for up to POST_MESSAGE_TIMEOUT or times out
const usePropsFromParentLegacy = (
  onSuccess: (props: BifrostProps) => void,
  onTimeout: () => void,
) => {
  const footprintProvider = useFootprintProvider();
  const timerId = useRef<NodeJS.Timeout | undefined>();

  const [legacyUserData, setLegacyUserData] = useState<
    IdvBootstrapData | undefined
  >();
  const [legacyOptions, setLegacyOptions] = useState<IdvOptions | undefined>();

  const unsubscribeLegacyBootstrap = footprintProvider.on(
    LegacyFootprintInternalEvent.bootstrapDataReceived,
    (data: unknown) => {
      const parsed = parseLegacyUserData(data as IdvBootstrapData);
      setLegacyUserData(parsed);
    },
  );

  const unsubscribeLegacyOptions = footprintProvider.on(
    LegacyFootprintInternalEvent.optionsReceived,
    (data: unknown) => {
      setLegacyOptions(data as IdvOptions);
    },
  );

  const unsubscribe = () => {
    unsubscribeLegacyBootstrap();
    unsubscribeLegacyOptions();
  };

  const handleTimeout = () => {
    unsubscribe();
    // If we received either user data or options, call onSuccess
    if (legacyUserData || legacyOptions) {
      onSuccess({
        userData: legacyUserData,
        options: legacyOptions,
        l10n: undefined,
        authToken: undefined,
      });
      return;
    }
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

  useEffect(() => {
    // If we received both user data and options, call on success
    if (legacyUserData && legacyOptions) {
      clearTimeout(timerId.current);
      unsubscribe();
      onSuccess?.({
        userData: legacyUserData,
        options: legacyOptions,
        l10n: undefined,
        authToken: undefined,
      });
    }
  }, [legacyUserData, legacyOptions]);
};

export default usePropsFromParentLegacy;
