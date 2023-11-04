import { getErrorMessage } from '@onefootprint/request';
import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';
import { Passkey } from 'react-native-passkey';

import { Events, useAnalytics } from '@/utils/analytics';

import Register from './components/register';
import Retry from './components/retry';
import createMachine from './utils/state-machine';

export type PasskeysProps = {
  authToken: string;
  onDone?: (deviceResponseJson?: string | null) => void;
};

const Passkeys = ({ authToken, onDone }: PasskeysProps) => {
  const [state, send] = useMachine(() => createMachine());
  const analytics = useAnalytics();
  const { isSupported } = Passkey;

  const handleSkip = () => {
    // TODO: Analytics deprecate
    analytics.track(Events.PasskeyCompleted, { result: 'skip' });
    onDone(null);
  };

  const handleNotSupported = () => {
    analytics.track(Events.PasskeyCompleted, { result: 'not_supported' });
    onDone(null);
  };

  const handleSuccess = (deviceResponseJson: string) => {
    analytics.track(Events.PasskeyRegistrationSucceeded);
    // TODO: Analytics deprecate
    analytics.track(Events.PasskeyCompleted, { result: 'success' });
    onDone(deviceResponseJson);
  };

  const handleError = (error: unknown) => {
    analytics.track(Events.PasskeyRegistrationFailed, {
      message: getErrorMessage(error),
    });
    send({ type: 'failed' });
  };

  useEffect(() => {
    if (!isSupported) {
      handleNotSupported();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported]);

  return isSupported ? (
    <>
      {state.matches('register') && (
        <Register
          authToken={authToken}
          onError={handleError}
          onSuccess={handleSuccess}
          onSkip={handleSkip}
        />
      )}
      {state.matches('retry') && (
        <Retry
          authToken={authToken}
          onSkip={handleSkip}
          onSuccess={handleSuccess}
        />
      )}
    </>
  ) : null;
};

export default Passkeys;
