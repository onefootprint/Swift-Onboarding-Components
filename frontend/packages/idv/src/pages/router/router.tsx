import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
} from '@onefootprint/idv-elements';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';

const Router = () => {
  const [state, send] = useIdvMachine();
  const {
    userData,
    tenantPk,
    sandboxSuffix,
    authToken,
    userFound,
    onClose,
    onComplete,
  } = state.context;
  useLogStateMachine('idv', state);

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      {state.matches('identify') && (
        <Identify
          bootstrapData={{
            email: userData?.[UserDataAttribute.email],
            phoneNumber: userData?.[UserDataAttribute.phoneNumber],
          }}
          tenantPk={tenantPk}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && (
        <Onboarding
          userFound={userFound}
          tenantPk={tenantPk}
          authToken={authToken}
          userData={userData}
          sandboxSuffix={sandboxSuffix}
          onClose={onClose}
          onComplete={onComplete}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
    </AppErrorBoundary>
  );
};

export default Router;
