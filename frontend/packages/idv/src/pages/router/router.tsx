import { useLogStateMachine } from '@onefootprint/dev-tools';
import {
  AppErrorBoundary,
  Identify,
  Onboarding,
} from '@onefootprint/idv-elements';
import { IdDI } from '@onefootprint/types';
import React, { useEffect } from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import Complete from '../complete';

type RouterProps = {
  onDone?: (validationToken?: string) => void;
};

const Router = ({ onDone }: RouterProps) => {
  const [state, send] = useIdvMachine();
  const {
    data,
    sandboxSuffix,
    authToken,
    userFound,
    isTransfer,
    validationToken,
    obConfigAuth,
    onClose,
    onComplete,
  } = state.context;
  useLogStateMachine('idv', state);
  const isDone = state.matches('complete');

  useEffect(() => {
    if (isDone) {
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
          obConfigAuth={obConfigAuth}
          // TODO: generalize this in the next iteratin
          bootstrapData={{
            email: data?.[IdDI.email],
            phoneNumber: data?.[IdDI.phoneNumber],
          }}
          onDone={payload => {
            send({ type: 'identifyCompleted', payload });
          }}
        />
      )}
      {state.matches('onboarding') && (
        <Onboarding
          authToken={authToken}
          obConfigAuth={obConfigAuth}
          userFound={userFound}
          // TODO: generalize this more in the next iteration
          data={data}
          sandboxSuffix={sandboxSuffix}
          isTransfer={isTransfer}
          onClose={onClose}
          onComplete={onComplete}
          onDone={payload => {
            send({ type: 'onboardingCompleted', payload });
          }}
        />
      )}
      {state.matches('complete') && !isTransfer && <Complete />}
    </AppErrorBoundary>
  );
};

export default Router;
