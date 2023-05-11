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
  CollectedDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
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
import { Layout } from 'src/components/layout';

import { PluginContext } from '../base-plugin';
import {
  CollectKybDataContext,
  CollectKybDataProps,
} from './collect-kyb-data.types';
import CollectKybData from './index';
import {
  withBusinessVault,
  withBusinessVaultValidate,
  withOnboardingConfig,
  withUserVault,
  withUserVaultValidate,
} from './index.test.config';

describe('<CollectKybData />', () => {
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

  const getOnboardingConfig = (
    mustCollectData?: CollectedDataOption[],
    canAccessData?: CollectedDataOption[],
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
    kycAttributes: CollectedKycDataOption[],
    kybAttributes: CollectedKybDataOption[],
  ): PluginContext<CollectKybDataContext> => {
    const allAttributes = [...kycAttributes, ...kybAttributes];

    return {
      authToken: 'token',
      customData: {
        config: getOnboardingConfig(allAttributes, allAttributes),
        requirement: {
          kind: OnboardingRequirementKind.collectKybData,
          missingAttributes: kybAttributes,
        },
        kycRequirement: {
          kind: OnboardingRequirementKind.collectKycData,
          missingAttributes: kycAttributes,
        },
        userFound: true,
        email: 'piip@onefootprint.com',
      },
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
      },
    };
  };

  const renderPlugin = ({ context, onDone }: CollectKybDataProps) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.light}>
              <ToastProvider>
                <Layout>
                  <CollectKybData context={context} onDone={onDone} />
                </Layout>
              </ToastProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  describe('when there are missing attribute', () => {
    beforeEach(() => {
      withOnboardingConfig();
      withBusinessVaultValidate();
      withBusinessVault();
      withUserVaultValidate();
      withUserVault();
    });

    it('takes user through all of the pages', async () => {
      const onDone = jest.fn();

      renderPlugin({
        context: getContext(
          [CollectedKycDataOption.name, CollectedKycDataOption.ssn4],
          [CollectedKybDataOption.beneficialOwners],
        ),
        onDone,
      });

      await waitFor(() => {
        expect(
          screen.getByText("Let's get to know your business!", {
            exact: false,
          }),
        ).toBeInTheDocument();
      });

      let submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Who are the beneficial owners?'),
        ).toBeInTheDocument();
      });

      let firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Jane')).toBeInTheDocument();
      await userEvent.type(firstName, 'John');

      let lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
      await userEvent.type(lastName, 'Doe');

      let ownershipStake = screen.getByLabelText(
        'Approximate ownership stake (%)',
      );
      expect(ownershipStake).toBeInTheDocument();
      expect(screen.getByPlaceholderText('25')).toBeInTheDocument();
      await userEvent.type(ownershipStake, '50');

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText('Confirm your business data'),
        ).toBeInTheDocument();
      });

      firstName = screen.getByText('John');
      expect(firstName).toBeInTheDocument();

      lastName = screen.getByText('Doe');
      expect(lastName).toBeInTheDocument();

      ownershipStake = screen.getByText('50%');
      expect(ownershipStake).toBeInTheDocument();

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Basic Data')).toBeInTheDocument();
      });

      firstName = screen.getByLabelText('First name');
      expect(firstName).toBeInTheDocument();
      expect(firstName).toHaveValue('John');
      expect(firstName).toBeDisabled();

      lastName = screen.getByLabelText('Last name');
      expect(lastName).toBeInTheDocument();
      expect(lastName).toHaveValue('Doe');
      expect(lastName).toBeDisabled();

      submitButton = screen.getByRole('button', { name: 'Continue' });
      expect(submitButton).toBeInTheDocument();
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'What are the last 4 digits of your Social Security Number?',
          ),
        ).toBeInTheDocument();
      });

      const ssn4 = screen.getByLabelText('SSN (last 4)');
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

      firstName = screen.getByText('John');
      expect(firstName).toBeInTheDocument();

      lastName = screen.getByText('Doe');
      expect(lastName).toBeInTheDocument();

      const ssn = screen.getByText('1234');
      expect(ssn).toBeInTheDocument();

      submitButton = screen.getByRole('button', { name: 'Confirm & Continue' });
      expect(submitButton).toBeInTheDocument();
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
