import { useLogStateMachine } from '@onefootprint/dev-tools';
import Idv from '@onefootprint/idv';
import { AppErrorBoundary, useGetD2PStatus } from '@onefootprint/idv-elements';
import { CLIENT_PUBLIC_KEY_HEADER, GetD2PResponse } from '@onefootprint/types';
import React from 'react';
import Layout from 'src/components/layout';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

import Canceled from '../canceled';
import Complete from '../complete';
import Expired from '../expired';
import Init from '../init';

const Router = () => {
  const [state, send] = useHandoffMachine();
  const { authToken, onboardingConfig } = state.context;
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
    <Layout>
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
