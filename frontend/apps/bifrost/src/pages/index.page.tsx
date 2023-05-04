import { useLogStateMachine } from '@onefootprint/dev-tools';
import Idv from '@onefootprint/idv';
import {
  AppErrorBoundary,
  Layout,
  useFootprintProvider,
} from '@onefootprint/idv-elements';
import { IdDI } from '@onefootprint/types';
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
  const { bootstrapData } = state.context;
  useLogStateMachine('bifrost', state);

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
        appearance={appearance}
        tenantPk={tenantPk}
        onClose={footprint.close}
      >
        {state.matches('init') && <Init />}
        {state.matches('idv') && (
          <Idv
            tenantPk={tenantPk}
            data={{
              [IdDI.email]: bootstrapData?.email,
              [IdDI.phoneNumber]: bootstrapData?.phoneNumber,
            }}
            onComplete={validationToken => {
              send({ type: 'idvCompleted', payload: { validationToken } });
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
