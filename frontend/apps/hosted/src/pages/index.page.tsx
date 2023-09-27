import { useObserveCollector } from '@onefootprint/dev-tools';
import type { FootprintVariant } from '@onefootprint/footprint-js';
import Idv from '@onefootprint/idv';
import { AppErrorBoundary } from '@onefootprint/idv-elements';
import { IdDI } from '@onefootprint/types';
import * as LogRocket from 'logrocket';
import React from 'react';
import Layout from 'src/components/layout';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import { useEffectOnce } from 'usehooks-ts';

import Expired from './expired';
import Init from './init';
import Intro from './intro';
import InvalidUrl from './invalid-url';

type RootProps = {
  variant?: FootprintVariant;
};

const Root = ({ variant }: RootProps) => {
  const [state, send] = useHostedMachine();
  const { businessBoKycData, obConfigAuth, authToken } = state.context;
  const { invited } = businessBoKycData || {};
  const { email, phoneNumber } = invited || {};

  const observeCollector = useObserveCollector();
  useEffectOnce(() => {
    LogRocket.getSessionURL(logRocketSessionUrl => {
      observeCollector.setAppContext({
        logRocketSessionUrl,
      });
    });
  });

  return (
    <Layout variant={variant}>
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
