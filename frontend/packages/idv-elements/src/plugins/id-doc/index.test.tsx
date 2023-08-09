import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { createUseRouterSpy, render, screen } from '@onefootprint/test-utils';
import { OnboardingRequirementKind } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import FootprintProvider from 'src/components/footprint-provider';
import { Layout } from 'src/components/layout';

import type { DeviceInfo } from '../../hooks/ui/use-device-info';
import { PluginContext } from '../base-plugin';
import IdDoc from './index';
import { IdDocCustomData, IdDocProps } from './types';

describe('<IdDoc />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
    useRouterSpy({
      pathname: '/',
      query: {
        public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY',
      },
    });
  });

  const renderPlugin = ({ context, onDone }: IdDocProps) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.light}>
              <FootprintProvider client={null as any}>
                <ToastProvider>
                  <Layout>
                    <IdDoc context={context} onDone={onDone} />
                  </Layout>
                </ToastProvider>
              </FootprintProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  const getContext = (
    shouldCollectSelfie?: boolean,
    shouldCollectConsent?: boolean,
    device?: DeviceInfo,
    onlyUsSupported?: boolean,
    supportedDocumentTypes?: SupportedIdDocTypes[],
  ): PluginContext<IdDocCustomData> => ({
    authToken: 'token',
    customData: {
      requirement: {
        kind: OnboardingRequirementKind.idDoc,
        shouldCollectSelfie: shouldCollectSelfie ?? false,
        shouldCollectConsent: shouldCollectConsent ?? false,
        onlyUsSupported: onlyUsSupported || false,
        supportedDocumentTypes: supportedDocumentTypes ?? [
          SupportedIdDocTypes.driversLicense,
          SupportedIdDocTypes.idCard,
          SupportedIdDocTypes.passport,
        ],
      },
    },
    device: device ?? {
      type: 'mobile',
      hasSupportForWebauthn: true,
    },
  });

  describe('when on mobile', () => {
    it('should collect id doc', () => {
      const onDone = jest.fn();

      renderPlugin({
        context: getContext(),
        onDone,
      });

      expect(screen.getByText('Scan or upload your ID')).toBeInTheDocument();
    });
  });
});
