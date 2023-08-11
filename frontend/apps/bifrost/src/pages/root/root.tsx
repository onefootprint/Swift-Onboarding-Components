import getCustomAppearance from '@onefootprint/appearance';
import { useLogStateMachine } from '@onefootprint/dev-tools';
import { FootprintVariant } from '@onefootprint/footprint-js';
import Idv from '@onefootprint/idv';
import {
  AppErrorBoundary,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import type { GetServerSideProps } from 'next';
import React from 'react';
import Layout from 'src/components/layout';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import Init from '../init';

type RootProps = {
  variant?: FootprintVariant;
};

const Root = ({ variant }: RootProps) => {
  const footprint = useFootprintProvider();
  const [state, send] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { bootstrapData, showCompletionPage, showLogo } = state.context;
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

  const handleClose = () => {
    footprint.cancel();
    footprint.close();
  };

  return (
    <Layout variant={variant}>
      <AppErrorBoundary
        onReset={() => {
          send({ type: 'reset' });
        }}
      >
        {state.matches('init') && <Init />}
        {state.matches('idv') && (
          <Idv
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData}
            onComplete={handleComplete}
            onClose={handleClose}
            showCompletionPage={showCompletionPage}
            showLogo={showLogo}
          />
        )}
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

  const obConfig = query.public_key as string | undefined;
  const params = query as Record<string, string>;
  const response = await getCustomAppearance({
    strategy: ['queryParameters', 'obConfig'],
    obConfig,
    params,
    variant: params.variant,
  });
  return { props: response };
};

export default Root;
