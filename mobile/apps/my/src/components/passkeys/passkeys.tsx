import { getErrorMessage } from '@onefootprint/request';
import { useMachine } from '@xstate/react';
import React from 'react';

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

  const handleSuccess = (deviceResponseJson: string) => {
    analytics.track(Events.PasskeyRegistrationSucceeded);
    // TODO: Analytics deprecate
    analytics.track(Events.PasskeyCompleted, { result: 'success' });
    onDone(deviceResponseJson);
  };

  const handleSkip = () => {
    // TODO: Analytics deprecate
    // TODO: Deprecate
    analytics.track(Events.PasskeyCompleted, { result: 'skip' });
    onDone(null);
  };

  const handleError = (error: unknown) => {
    analytics.track(Events.PasskeyRegistrationFailed, {
      message: getErrorMessage(error),
    });
    send({ type: 'failed' });
  };

  return (
    <>
      {state.matches('register') && (
        <Register
          authToken={authToken}
          onError={handleError}
          onSuccess={handleSuccess}
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
  );
};

export default Passkeys;
