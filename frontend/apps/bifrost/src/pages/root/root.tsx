import getCustomAppearance from '@onefootprint/appearance';
import { useObserveCollector } from '@onefootprint/dev-tools';
import type { FootprintVariant } from '@onefootprint/footprint-js';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from '@onefootprint/global-constants';
import type { IdvCompletePayload } from '@onefootprint/idv';
import Idv, {
  AppErrorBoundary,
  Logger,
  useFootprintProvider,
  useLogStateMachine,
} from '@onefootprint/idv';
import { checkIsAndroid } from '@onefootprint/idv/src/utils';
import checkIsIframe from '@onefootprint/idv/src/utils/check-is-in-iframe';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import * as LogRocket from 'logrocket';
import type { GetServerSideProps } from 'next';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { useEffectOnce } from 'usehooks-ts';

import Layout from '../../components/layout';
import Complete from '../complete';
import Init from '../init';
import InitError from '../init-error';

type RootProps = {
  variant?: FootprintVariant;
};

const Root = ({ variant }: RootProps) => {
  const fpProvider = useFootprintProvider();
  const [state, send] = useBifrostMachine();
  const {
    bootstrapData,
    l10n,
    showCompletionPage,
    showLogo,
    authToken,
    publicKey,
  } = state.context;
  const obConfigAuth = publicKey
    ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKey }
    : undefined;

  const isAndroidWebview = !checkIsIframe() && checkIsAndroid();
  const shouldShowCompletionPage = showCompletionPage || isAndroidWebview;

  const observeCollector = useObserveCollector();
  useLogStateMachine('bifrost', state);
  useEffectOnce(() => {
    LogRocket.getSessionURL(logRocketSessionUrl => {
      observeCollector.setAppContext({
        logRocketSessionUrl,
      });
    });
  });

  const handleComplete = ({
    validationToken,
    authToken: idvAuthToken,
    deviceResponseJson,
  }: IdvCompletePayload) => {
    Logger.info(
      'IDV flow is complete, sending validation token back to the tenant',
    );
    if (validationToken) {
      if (!shouldShowCompletionPage) {
        fpProvider.complete({
          validationToken,
          deviceResponseJson,
          authToken: idvAuthToken,
        });
        return;
      }

      send({
        type: 'idvComplete',
        payload: {
          validationToken,
          deviceResponseJson,
          authToken: idvAuthToken,
        },
      });
    }
  };

  const handleClose = () => {
    Logger.info('IDV flow is closed by the user');
    fpProvider.cancel();
    fpProvider.close();
  };

  return (
    <Layout variant={variant}>
      <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
        {state.matches('init') && <Init fpProvider={fpProvider} />}
        {state.matches('initError') && <InitError />}
        {state.matches('idv') && (
          <Idv
            authToken={authToken}
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData}
            onComplete={handleComplete}
            onClose={handleClose}
            showLogo={showLogo}
            l10n={l10n}
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

  const obConfig = query.public_key as string | undefined;
  const language = query.lng as string | undefined;
  const params = query as Record<string, string>;
  const response = await getCustomAppearance({
    strategy: ['queryParameters', 'obConfig'],
    obConfig,
    params,
    variant: params.variant,
  });

  return {
    props: {
      ...response,
      language: language ?? 'en',
    },
  };
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
