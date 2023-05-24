import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import { IdDI } from '@onefootprint/types';
import React from 'react';
import Layout from 'src/components/layout';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Expired from './expired';
import Init from './init';
import Intro from './intro';

const Root = () => {
  const [state, send] = useHostedMachine();
  const { businessBoKycData, obConfigAuth } = state.context;
  const { invited } = businessBoKycData || {};
  const { email, phoneNumber } = invited || {};

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      <Layout>
        {state.matches('init') && <Init />}
        {state.matches('intro') && <Intro />}
        {state.matches('expired') && <Expired />}
        {state.matches('idv') && obConfigAuth && (
          <Idv
            bootstrapData={{
              [IdDI.email]: email,
              [IdDI.phoneNumber]: phoneNumber,
            }}
            obConfigAuth={obConfigAuth}
          />
        )}
      </Layout>
    </AppErrorBoundary>
  );
};

export default Root;
