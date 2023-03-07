import {
  useLogStateMachine,
  useObserveCollector,
} from '@onefootprint/dev-tools';
import {
  DeviceSignals,
  IdDoc,
  Liveness,
  useGetD2PStatus,
} from '@onefootprint/footprint-elements';
import { GetD2PResponse } from '@onefootprint/types';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

import Canceled from './canceled';
import CheckRequirements from './check-requirements';
import Complete from './complete';
import Error from './error';
import Expired from './expired';
import Init from './init';

const Root = () => {
  const [state, send] = useHandoffMachine();
  const { authToken, device, requirements } = state.context;
  const observeCollector = useObserveCollector();
  useLogStateMachine('handoff', state);

  useGetD2PStatus({
    enabled: !state.done,
    authToken: authToken ?? '',
    options: {
      onSuccess: (data: GetD2PResponse) => {
        send({
          type: 'statusReceived',
          payload: {
            status: data.status,
          },
        });
      },
      onError: () => {
        send({
          type: 'statusReceived',
          payload: {
            isError: true,
          },
        });
      },
    },
  });

  return (
    <ErrorBoundary
      FallbackComponent={Error}
      onError={(error, stack) => {
        observeCollector.logError('error', error, { stack });
      }}
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      {state.matches('init') && <Init />}
      {state.matches('complete') && <Complete />}
      {state.matches('canceled') && <Canceled />}
      {state.matches('expired') && <Expired />}
      {state.matches('checkRequirements') && <CheckRequirements />}
      {state.matches('liveness') && !!authToken && !!device && (
        <DeviceSignals page="liveness" fpAuthToken={authToken}>
          <Liveness
            context={{
              authToken,
              device,
            }}
            onDone={() => {
              send({ type: 'requirementCompleted' });
            }}
          />
        </DeviceSignals>
      )}
      {state.matches('idDoc') && !!authToken && !!device && (
        <DeviceSignals page="id-doc" fpAuthToken={authToken}>
          <IdDoc
            context={{
              authToken,
              device,
              customData: {
                shouldCollectIdDoc: requirements?.missingIdDoc,
                shouldCollectSelfie: requirements?.missingSelfie,
                shouldCollectConsent: requirements?.missingConsent,
              },
            }}
            onDone={() => {
              send({ type: 'requirementCompleted' });
            }}
          />
        </DeviceSignals>
      )}
    </ErrorBoundary>
  );
};

export default Root;
