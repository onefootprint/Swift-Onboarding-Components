import type { FootprintVariant } from '@onefootprint/footprint-js';
import Idv, { AppErrorBoundary, Logger, useGetD2PStatus, useLogStateMachine } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import type { GetD2PResponse } from '@onefootprint/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React from 'react';
import useHandoffMachine from 'src/hooks/use-handoff-machine';

import Layout from '../../components/layout';
import Canceled from '../canceled';
import Complete from '../complete';
import Expired from '../expired';
import Init from '../init';

type RouterProps = {
  variant?: FootprintVariant;
};

const Router = ({ variant }: RouterProps) => {
  const [state, send] = useHandoffMachine();
  const { authToken, onboardingConfig, idDocOutcome, l10n } = state.context;
  const tenantPk = onboardingConfig?.key;

  useLogStateMachine('handoff', state);

  const obConfigAuth = tenantPk && {
    [CLIENT_PUBLIC_KEY_HEADER]: tenantPk,
  };

  useGetD2PStatus({
    enabled: !state.done,
    authToken: authToken ?? '',
    options: {
      onSuccess: (data: GetD2PResponse) => {
        if (!state.done) {
          send({
            type: 'statusReceived',
            payload: {
              status: data.status,
            },
          });
        }
      },
      onError: error => {
        Logger.warn(
          `Fetching d2p status failed with error, likely indicating expired session: ${getErrorMessage(error)}`,
          { location: 'handoff-router' },
        );

        if (!state.done) {
          send({
            type: 'statusReceived',
            payload: {
              isError: true,
            },
          });
        }
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
            l10n={l10n}
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
