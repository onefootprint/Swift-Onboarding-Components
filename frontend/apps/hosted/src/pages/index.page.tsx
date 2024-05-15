import type { FootprintVariant } from '@onefootprint/footprint-js';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from '@onefootprint/global-constants';
import Idv, { AppErrorBoundary, Logger } from '@onefootprint/idv';
import { IdDI } from '@onefootprint/types';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { GetServerSideProps } from 'next';
import React from 'react';
import Layout from 'src/components/layout';
import useHostedMachine from 'src/hooks/use-hosted-machine';

import Complete from './complete';
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

  const handleComplete = () => {
    Logger.info('IDV flow is completed on hosted');
    send({
      type: 'idvCompleted',
    });
  };

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
            onComplete={handleComplete}
            showLogo
          />
        )}
        {state.matches('complete') && <Complete />}
      </AppErrorBoundary>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=3600',
  );

  return { props: { language: query.lng ?? 'en' } };
};

export default withLDProvider({
  clientSideID: LAUNCH_DARKLY_CLIENT_SIDE_ID,
  options: {
    streaming: false,
    allAttributesPrivate: true,
    disableSyncEventPost: true,
  },
  reactOptions: {
    useCamelCaseFlagKeys: false,
  },
})(Root);
