import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import IdDoc from '@/components/id-doc';
import RegisterPasskey from '@/components/register-passkey';

import CheckRequirements from '../check-requirements';
import useAttestDevice from './hooks/use-attest-device';
import createMachine from './utils/state-machine';

type RouterProps = {
  authToken: string;
  onDone: () => void;
};

const Router = ({ authToken, onDone }: RouterProps) => {
  const [state, send] = useMachine(() => createMachine());
  const {
    remainingRequirements: { idDoc },
  } = state.context;
  const attestDeviceMutation = useAttestDevice();

  useEffect(() => {
    if (state.done) {
      onDone();
    }
  }, [state.done, onDone]);

  const attestDevice = (deviceResponseJson: string | null = null) => {
    attestDeviceMutation.mutate({ authToken, deviceResponseJson });
  };

  return (
    <>
      {state.matches('check') && (
        <CheckRequirements
          authToken={authToken}
          onSuccess={remainingRequirements => {
            send({
              type: 'remainingRequirementsReceived',
              payload: {
                remainingRequirements,
              },
            });
          }}
        />
      )}
      {state.matches('passkeys') && (
        <RegisterPasskey
          authToken={authToken}
          onDone={deviceResponseJson => {
            if (deviceResponseJson) {
              attestDevice(deviceResponseJson);
            }
            send({ type: 'requirementCompleted' });
          }}
        />
      )}
      {state.matches('idDoc') && idDoc && (
        <IdDoc requirement={idDoc} authToken={authToken} onDone={() => send({ type: 'requirementCompleted' })} />
      )}
    </>
  );
};

export default Router;
