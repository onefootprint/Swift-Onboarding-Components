import { useLogStateMachine } from '@onefootprint/dev-tools';
import Idv from '@onefootprint/idv';
import {
  AppErrorBoundary,
  Layout,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { useRouter } from 'next/router';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import useTenantPublicKey from 'src/hooks/use-tenant-public-key';

import Init from './init';

const CLOSE_DELAY = 6000;

const Root = () => {
  const footprint = useFootprintProvider();
  const [state, send] = useBifrostMachine();
  const tenantPk = useTenantPublicKey();
  const { bootstrapData, config } = state.context;
  const isSandbox = config?.isLive === false;
  useLogStateMachine('bifrost', state);
  const obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: tenantPk };

  const router = useRouter();
  const searchParams = new URLSearchParams(router.asPath);
  const fontSrc = searchParams.get('font_src') ?? undefined;
  const variables = searchParams.get('tokens') ?? undefined;
  const rules = searchParams.get('rules') ?? undefined;
  const appearance = { fontSrc, rules, variables };

  return (
    <AppErrorBoundary
      onReset={() => {
        send({ type: 'reset' });
      }}
    >
      <Layout
        options={{ hasDesktopBorderRadius: true }}
        isSandbox={isSandbox}
        appearance={appearance}
        tenantPk={tenantPk}
        onClose={footprint.close}
      >
        {state.matches('init') && <Init />}
        {state.matches('idv') && (
          <Idv
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData}
            onComplete={validationToken => {
              if (validationToken) {
                footprint.complete({
                  validationToken,
                  closeDelay: CLOSE_DELAY,
                });
              }
            }}
            onClose={footprint.close}
          />
        )}
      </Layout>
    </AppErrorBoundary>
  );
};

export default Root;
