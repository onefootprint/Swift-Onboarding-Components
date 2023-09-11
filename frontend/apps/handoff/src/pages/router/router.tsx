import { useLogStateMachine } from '@onefootprint/dev-tools';
import type { FootprintVariant } from '@onefootprint/footprint-js';
import Idv from '@onefootprint/idv';
import { AppErrorBoundary, useGetD2PStatus } from '@onefootprint/idv-elements';
import type { GetD2PResponse } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React from 'react';
import Layout from 'src/components/layout';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

import Canceled from '../canceled';
import Complete from '../complete';
import Expired from '../expired';
import Init from '../init';

type RouterProps = {
  variant?: FootprintVariant;
};

const Router = ({ variant }: RouterProps) => {
  const [state, send] = useHandoffMachine();
  const { authToken, onboardingConfig, idDocOutcome } = state.context;
  const tenantPk = onboardingConfig?.key;

  const obConfigAuth = tenantPk && {
    [CLIENT_PUBLIC_KEY_HEADER]: tenantPk,
  };
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
      onError: error => {
        console.warn(
          'Fetching d2p status failed with error, likely indicating expired session:',
          error,
        );
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
    <Layout variant={variant}>
      <AppErrorBoundary
        onReset={() => {
          send({ type: 'reset' });
        }}
      >
        {state.matches('init') && <Init />}
        {state.matches('idv') && obConfigAuth && (
          <Idv
            authToken={authToken}
            obConfigAuth={obConfigAuth}
            isTransfer
            onComplete={() => {
              send({ type: 'idvCompleted' });
            }}
            idDocOutcome={idDocOutcome}
          />
        )}
        {state.matches('complete') && <Complete />}
        {state.matches('canceled') && <Canceled />}
        {state.matches('expired') && <Expired />}
      </AppErrorBoundary>
    </Layout>
  );
};

export default Router;
