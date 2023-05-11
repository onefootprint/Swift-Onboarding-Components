import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  render,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import {
  CollectedKycDataOption,
  IdDI,
  OnboardingConfig,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import FootprintProvider from 'src/components/footprint-provider';
import { Layout } from 'src/components/layout';

import { PluginContext } from '../base-plugin';
import CollectKycData from './index';
import {
  withOnboardingConfig,
  withUserVault,
  withUserVaultValidate,
} from './index.test.config';
import { CollectKycDataContext, CollectKycDataProps } from './types';

describe('<CollectKycData />', () => {
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

  const renderPlugin = ({ context, onDone }: CollectKycDataProps) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.light}>
              <FootprintProvider client={null as any}>
                <ToastProvider>
                  <Layout>
                    <CollectKycData context={context} onDone={onDone} />
                  </Layout>
                </ToastProvider>
              </FootprintProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  const getOnboardingConfig = (
    mustCollectData?: CollectedKycDataOption[],
    canAccessData?: CollectedKycDataOption[],
  ): OnboardingConfig => ({
    isLive: true,
    createdAt: 'date',
    id: 'id',
    key: 'key',
    logoUrl: 'url',
    privacyPolicyUrl: 'url',
    name: 'tenant',
    orgName: 'tenantOrg',
    status: 'enabled',
    mustCollectData: mustCollectData ?? [],
    canAccessData: canAccessData ?? [],
  });

  const getContext = (
    attributes?: CollectedKycDataOption[],
  ): PluginContext<CollectKycDataContext> => ({
    authToken: 'token',
    customData: {
      requirement: {
        kind: OnboardingRequirementKind.collectKycData,
        missingAttributes: attributes ?? [],
      },
      bootstrapData: {
        [IdDI.email]: 'piip@onefootprint.com',
      },
      userFound: true,
      sandboxSuffix: 'sandbox',
      config: getOnboardingConfig(attributes, attributes),
    },
    device: {
      type: 'mobile',
      hasSupportForWebauthn: true,
    },
  });

  describe('when there are missing attributes', () => {
    beforeEach(() => {
      withOnboardingConfig();
      withUserVaultValidate();
      withUserVault();
    });

    it('takes user through all of the pages', async () => {
      const onDone = jest.fn();

      renderPlugin({
        context: getContext([
          CollectedKycDataOption.name,
          CollectedKycDataOption.dob,
          CollectedKycDataOption.ssn4,
        ]),
        onDone,
      });

      await waitFor(() => {
        expect(screen.getByText('Basic Data')).toBeInTheDocument();
      });

      let firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      await userEvent.type(firstName, 'Piip');
      expect(firstName).toHaveValue('Piip');

      let lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      await userEvent.type(lastName, 'Test');
      expect(lastName).toHaveValue('Test');

      let dob = screen.getByLabelText('Date of Birth');
      expect(dob).toBeInTheDocument();
      await userEvent.type(dob, '01/01/1990');
      expect(dob).toHaveValue('01/01/1990');

      let submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'What are the last 4 digits of your Social Security Number?',
          ),
        ).toBeInTheDocument();
      });

      let ssn4 = screen.getByLabelText('SSN (last 4)');
      expect(ssn4).toBeInTheDocument();
      await userEvent.type(ssn4, '1234');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Confirm your personal data'),
        ).toBeInTheDocument();
      });

      firstName = screen.getByText('Piip');
      expect(firstName).toBeInTheDocument();

      lastName = screen.getByText('Test');
      expect(lastName).toBeInTheDocument();

      dob = screen.getByText('01/01/1990');
      expect(dob).toBeInTheDocument();

      ssn4 = screen.getByText('1234');
      expect(ssn4).toBeInTheDocument();

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
