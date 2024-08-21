import getCustomAppearance from '@onefootprint/appearance';
import { FootprintPrivateEvent, type FootprintVariant } from '@onefootprint/footprint-js';
import { LAUNCH_DARKLY_CLIENT_SIDE_ID } from '@onefootprint/global-constants';
import type { IdvCompletePayload } from '@onefootprint/idv';
import Idv, {
  AppErrorBoundary,
  getLogger,
  Logger,
  useFootprintProvider,
  useLogStateMachine,
  SessionExpired,
} from '@onefootprint/idv';
import { useIdentifyValidate } from '@onefootprint/idv/src/queries';
import { checkIsAndroid } from '@onefootprint/idv/src/utils';
import checkIsIframe from '@onefootprint/idv/src/utils/check-is-in-iframe';
import { type ComponentsSdkContext, ComponentsSdkTypes } from '@onefootprint/idv/src/utils/state-machine/types';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import type { GetServerSideProps } from 'next';
import { useCallback } from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';

import Layout from '../../components/layout';
import Complete from '../complete';
import Init from '../init';
import InitError from '../init-error';

type RootProps = { variant?: FootprintVariant };

const { logError, logInfo } = getLogger({ location: 'bifrost-root' });

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
    isComponentsSdk,
    sandboxOutcome: { overallOutcome, idDocOutcome } = {},
  } = state.context;
  const obConfigAuth = publicKey ? { [CLIENT_PUBLIC_KEY_HEADER]: publicKey } : undefined;

  const isWebview = !checkIsIframe();
  const isAndroidWebview = !checkIsIframe() && checkIsAndroid();
  const shouldShowCompletionPage = showCompletionPage || isAndroidWebview;
  const mutIdentifyValidate = useIdentifyValidate();

  useLogStateMachine('bifrost', state);

  const handleIdentifyCompletion = useCallback(
    (args: { authToken: string }) => {
      mutIdentifyValidate.mutate(
        { authToken: args.authToken },
        {
          onError: err => logError('Error while validating auth token', err),
          onSuccess: res => fpProvider.auth(res.validationToken),
        },
      );
    },
    [fpProvider, mutIdentifyValidate],
  );

  const handleBifrostCompletion = ({
    validationToken,
    authToken: idvAuthToken,
    deviceResponseJson,
  }: IdvCompletePayload) => {
    logInfo('IDV flow is complete, sending validation token back to the tenant');
    Logger.stopSessionReplay();

    if (validationToken) {
      if (!shouldShowCompletionPage) {
        fpProvider.complete({
          validationToken,
          deviceResponse: deviceResponseJson,
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
    logInfo('IDV flow is closed by the user');
    Logger.stopSessionReplay();
    fpProvider.cancel();
    fpProvider.close();
  };

  let componentsSdkContext: ComponentsSdkContext | undefined;
  if (isComponentsSdk) {
    componentsSdkContext = {
      onRelayFromComponents: (cb: () => void) => fpProvider.on(FootprintPrivateEvent.relayFromComponents, cb),
      relayToComponents: fpProvider.relayToComponents,
      componentsSdkType: isWebview ? ComponentsSdkTypes.MOBILE : ComponentsSdkTypes.WEB,
      skipRelayToComponents: isWebview && !!authToken,
    };
  }

  return (
    <Layout variant={variant}>
      <AppErrorBoundary onReset={() => send({ type: 'reset' })}>
        {state.matches('init') && <Init />}
        {state.matches('sessionExpired') && <SessionExpired onRestart={() => undefined} retryLimitExceeded />}
        {state.matches('initError') && <InitError />}
        {state.matches('idv') && (
          <Idv
            authToken={authToken}
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData}
            onComplete={handleBifrostCompletion}
            onClose={handleClose}
            onIdentifyDone={handleIdentifyCompletion}
            showLogo={showLogo}
            componentsSdkContext={componentsSdkContext}
            overallOutcome={overallOutcome}
            idDocOutcome={idDocOutcome}
            l10n={l10n}
          />
        )}
        {state.matches('complete') && <Complete />}
      </AppErrorBoundary>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=3600');

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
