'use client';

import { getLogger } from '@onefootprint/idv';

import PasskeyCancelled from '../passkey-cancelled';
import PasskeyError from '../passkey-error';
import UnexpectedError from '../unexpected-error';
import IdentifyAuth from './pages/identify-auth';
import Init from './pages/init';
import InvalidAuthConfig from './pages/invalid-auth-config';
import InvalidConfig from './pages/invalid-config';
import InvalidDomain from './pages/invalid-domain';
import OnboardingValidation from './pages/onboarding-validation';
import PasskeyAdd from './pages/passkey-add';
import PasskeyProcessing from './pages/passkey-processing';
import Success from './pages/success';
import { useAuthIdentifyAppMachine } from './state';

const { logTrack, logWarn } = getLogger({ location: 'auth-identify-router' });

const IdentifyRouter = () => {
  const [state, send] = useAuthIdentifyAppMachine();
  const { authToken, device } = state.context;
  const isDone = state.matches('done');

  if (isDone) return <Success />;

  if (state.matches('init')) {
    return <Init />;
  }

  if (state.matches('identify')) {
    return <IdentifyAuth />;
  }

  if (state.matches('onboardingValidation')) {
    return <OnboardingValidation />;
  }

  if (state.matches('passkeyOptionalRegistration') && authToken && device) {
    return (
      <PasskeyAdd
        authToken={authToken}
        device={device}
        onSkip={() => send({ type: 'passkeyRegistrationSkip' })}
        onError={(error: unknown) => {
          logWarn('Error on optional passkey registration', error);
          send({ type: 'passkeyRegistrationError', payload: error });
        }}
        onNewTabOpened={(tab: Window) => {
          logTrack('Passkey registration tab opened');
          send({ type: 'passkeyRegistrationTabOpened', payload: tab });
        }}
        onScopedAuthTokenGenerated={(authToken: string) => {
          send({ type: 'scopedAuthTokenReceived', payload: authToken });
        }}
      />
    );
  }

  if (state.matches('passkeyProcessing')) {
    return <PasskeyProcessing onCancelError={error => logWarn('Error on cancel passkey processing', error)} />;
  }

  if (state.matches('passkeyCancelled')) {
    return <PasskeyCancelled />;
  }

  if (state.matches('passkeyError')) {
    return <PasskeyError />;
  }

  if (state.matches('invalidAuthConfig')) {
    return <InvalidAuthConfig />;
  }

  if (state.matches('sdkUrlNotAllowed')) {
    return <InvalidDomain />;
  }

  if (state.matches('invalidConfig')) {
    return <InvalidConfig />;
  }

  if (state.matches('unexpectedError')) {
    return <UnexpectedError />;
  }
};

export default IdentifyRouter;
