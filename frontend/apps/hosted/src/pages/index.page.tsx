import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import { IdDI } from '@onefootprint/types';
import React from 'react';
import Layout from 'src/components/layout';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Expired from './expired';
import Init from './init';
import Intro from './intro';
import InvalidUrl from './invalid-url';

const Root = () => {
  const [state, send] = useHostedMachine();
  const { businessBoKycData, obConfigAuth, authToken } = state.context;
  const { invited } = businessBoKycData || {};
  const { email, phoneNumber } = invited || {};

  return (
    <Layout>
      <AppErrorBoundary
        onReset={() => {
          send({ type: 'reset' });
        }}
      >
        {state.matches('init') && <Init />}
        {state.matches('intro') && <Intro />}
        {state.matches('expired') && <Expired />}
        {state.matches('invalidUrl') && <InvalidUrl />}
        {state.matches('idv') && (
          <Idv
            bootstrapData={{
              [IdDI.email]: email,
              [IdDI.phoneNumber]: phoneNumber,
            }}
            authToken={authToken}
            obConfigAuth={obConfigAuth}
            showCompletionPage
            showLogo
          />
        )}
      </AppErrorBoundary>
    </Layout>
  );
};

export default Root;
