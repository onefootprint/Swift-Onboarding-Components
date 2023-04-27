import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
} from '@onefootprint/idv-elements';
import { UserDataAttribute } from '@onefootprint/types';
import React, { useEffect } from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';

type RouterProps = {
  onDone?: (validationToken: string) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useIdvMachine();
  const {
    userData,
    tenantPk,
    sandboxSuffix,
    authToken,
    userFound,
    validationToken,
    onClose,
    onComplete,
  } = state.context;
  useLogStateMachine('idv', state);
  const isDone = state.matches('complete');

  useEffect(() => {
    if (isDone && validationToken) {
      onDone?.(validationToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, onDone]);

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
