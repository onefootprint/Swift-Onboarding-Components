import { useLogStateMachine } from '@onefootprint/dev-tools';
import Idv from '@onefootprint/idv';
import {
  AppErrorBoundary,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React from 'react';
import Layout from 'src/components/layout';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import Init from './init';

const Root = () => {
  const footprint = useFootprintProvider();
  const [state, send] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { bootstrapData, showCompletionPage } = state.context;
  useLogStateMachine('bifrost', state);
  const obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk };

  const handleComplete = (validationToken?: string, delay?: number) => {
    if (validationToken) {
      footprint.complete({
        validationToken,
        closeDelay: delay,
      });
    }
  };

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      <Layout>
        {state.matches('init') && <Init />}
        {state.matches('idv') && (
          <Idv
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData}
            onComplete={handleComplete}
            onClose={footprint.cancel}
            showCompletionPage={showCompletionPage}
          />
        )}
      </Layout>
    </AppErrorBoundary>
  );
};

export default Root;
