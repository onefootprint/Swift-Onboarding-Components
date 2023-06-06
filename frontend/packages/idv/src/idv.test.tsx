import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { Layout } from '@onefootprint/idv-elements';
import {
  createUseRouterSpy,
  render,
  screen,
  waitFor,
} from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, IdDI } from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';

import Idv from './idv';
import {
  sandboxOnboardingConfigFixture,
  withIdentify,
  withOnboarding,
  withOnboardingConfig,
  withRequirements,
  withUserToken,
} from './idv.test.config';
import { IdvProps } from './types';

describe('<Idv />', () => {
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
      query: {},
    });
  });

  const renderIdv = ({
    obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' },
    isTransfer = false,
    bootstrapData,
    onComplete = jest.fn(),
    onClose = jest.fn(),
    authToken,
  }: Partial<IdvProps>) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.light}>
              <ToastProvider>
                <Layout>
                  <Idv
                    authToken={authToken}
                    obConfigAuth={obConfigAuth}
                    isTransfer={isTransfer}
                    bootstrapData={bootstrapData}
                    onComplete={onComplete}
                    onClose={onClose}
                  />
                </Layout>
              </ToastProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  describe('with auth token', () => {
    it('skips all pages when all data is bootstrapped', async () => {
      withUserToken();
      withIdentify();
      withOnboarding();
      withRequirements();

      renderIdv({
        authToken: 'token',
        bootstrapData: {
          [IdDI.email]: 'piip@onefootprint.com',
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
          [IdDI.phoneNumber]: '+155500334343',
          [IdDI.addressLine1]: '123 Home st',
          [IdDI.city]: 'San Francisco',
          [IdDI.state]: 'CA',
          [IdDI.zip]: '02342',
          [IdDI.country]: 'US',
          [IdDI.dob]: '05/23/1996',
          [IdDI.ssn9]: '123456789',
        },
      });

      await waitFor(() => {
        expect(
          screen.getByText('Confirm your personal data'),
        ).toBeInTheDocument();
      });

      expect(screen.getByText('Basic data')).toBeInTheDocument();

      expect(screen.getByText('First name')).toBeInTheDocument();
      expect(screen.getByText('Piip')).toBeInTheDocument();

      expect(screen.getByText('Last name')).toBeInTheDocument();
      expect(screen.getByText('Foot')).toBeInTheDocument();

      expect(screen.getByText('Date of birth')).toBeInTheDocument();
      expect(screen.getByText('05/23/1996')).toBeInTheDocument();

      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('02342, US')).toBeInTheDocument();

      expect(screen.getByText('Identity')).toBeInTheDocument();
      expect(screen.getByText('SSN')).toBeInTheDocument();
      expect(screen.getByText('123456789')).toBeInTheDocument();

      const confirmButton = screen.getByText('Confirm & Continue');
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('without auth token', () => {
    it('starts flow on email identification if no bootstrap is provided', async () => {
      withUserToken();
      withIdentify();
      withOnboarding();
      withOnboardingConfig();
      withRequirements();

      renderIdv({});

      await waitFor(() => {
        expect(
          screen.getByText('Enter your email to get started.'),
        ).toBeInTheDocument();
      });
    });

    it('starts flow on sandbox outcome if no bootstrap is provided', async () => {
      withUserToken();
      withIdentify();
      withOnboarding(sandboxOnboardingConfigFixture);
      withOnboardingConfig(sandboxOnboardingConfigFixture);
      withRequirements();

      renderIdv({});

      await waitFor(() => {
        expect(screen.getByText('Select test outcome')).toBeInTheDocument();
      });
    });
  });
});
