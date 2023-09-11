/* eslint-disable jest/expect-expect */
import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { Layout } from '@onefootprint/idv-elements';
import {
  createUseRouterSpy,
  render,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  D2PStatus,
  IdDI,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';

import Idv from './idv';
import {
  authorizeData,
  checkAdditionalDataRequired,
  checkComplete,
  confirmKycData,
  getKycOnboardingConfig,
  identifyUserByPhone,
  TestAuthorizeRequirement,
  withAuthorize,
  withD2PGenerate,
  withD2PStatus,
  withDecrypt,
  withIdentify,
  withOnboarding,
  withOnboardingConfig,
  withOnboardingValidate,
  withRequirements,
  withUserToken,
  withUserVault,
  withUserVaultValidate,
} from './idv.test.config';
import type { IdvProps } from './types';

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
    showCompletionPage,
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
                    showCompletionPage={showCompletionPage}
                  />
                </Layout>
              </ToastProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  describe('When onboarding with an existing user vault', () => {
    const config = getKycOnboardingConfig(true);
    const validationToken = 'validation-token';
    const closeDelay = 6000;

    beforeEach(() => {
      withOnboarding(config);
      withOnboardingConfig(config);
      withOnboardingValidate(validationToken);
    });

    describe('When onboarding to same config', () => {
      describe('When there are empty requirements', () => {
        beforeEach(() => {
          withRequirements([], []);
        });

        it.skip('skips completion page', async () => {
          const onComplete = jest.fn();
          const onClose = jest.fn();

          renderIdv({
            onComplete,
            onClose,
          });

          await identifyUserByPhone();

          await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(onComplete).toBeCalledWith(validationToken);
          });
        });

        it('can one-click when given an auth token', async () => {
          const onComplete = jest.fn();
          const onClose = jest.fn();

          renderIdv({
            authToken: 'token',
            showCompletionPage: true,
            onComplete,
            onClose,
          });

          await checkComplete();
          await waitFor(() => {
            expect(onComplete).toBeCalledWith(validationToken, closeDelay);
          });

          const linkButton = screen.getByText('Return to site');
          expect(linkButton).toBeInTheDocument();
          await userEvent.click(linkButton);
          expect(onClose).toBeCalled();
        });

        it.skip('can onboard directly after identify if already authorized', async () => {
          const onComplete = jest.fn();
          const onClose = jest.fn();

          renderIdv({
            showCompletionPage: true,
            onComplete,
            onClose,
          });

          await identifyUserByPhone();

          await checkComplete();
          await waitFor(() => {
            expect(onComplete).toBeCalledWith(validationToken, closeDelay);
          });
        });
      });

      it.skip('prompts user to confirm previous data when there are met requirements if redoing kyc', async () => {
        withUserToken();
        withIdentify(true);
        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: false,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );
        withDecrypt({
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
          [IdDI.dob]: '1996-05-23',
          [IdDI.ssn9]: '123-45-6789',
        });
        withUserVault();
        withAuthorize();

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          authToken: 'token',
          showCompletionPage: true,
          onComplete,
          onClose,
        });

        await confirmKycData();

        await waitFor(() => {
          expect(screen.getByText('Authorize access')).toBeInTheDocument();
        });

        // Update the mock response after we entered the authorize page
        // For next time we are checking for requirements
        // The CollectKycData plugin will only be shown once
        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await authorizeData();
        await checkComplete();
        await waitFor(() => {
          expect(onComplete).toBeCalledWith(validationToken, closeDelay);
        });
      });
    });

    describe('When onboarding to a new config', () => {
      beforeEach(() => {
        withUserToken();
        withUserVaultValidate();
        withUserVault();
        withAuthorize();
      });

      it('skips identify flow when provided an auth token', async () => {
        withIdentify();
        withRequirements();

        renderIdv({
          authToken: 'token',
          showCompletionPage: true,
        });

        await waitFor(() => {
          expect(screen.getByText('Basic Data')).toBeInTheDocument();
        });
      });

      it.skip('can onboard after identify, confirm and authorize', async () => {
        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        withDecrypt({
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
          [IdDI.dob]: '05/23/1996',
          [IdDI.ssn9]: '123-45-6789',
        });

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          showCompletionPage: true,
          onComplete,
          onClose,
        });

        await identifyUserByPhone();
        await confirmKycData();

        await waitFor(() => {
          expect(screen.getByText('Authorize access')).toBeInTheDocument();
        });

        // Update the mock response after we entered the authorize page
        // For next time we are checking for requirements
        // The CollectKycData plugin will only be shown once
        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await authorizeData();
        await checkComplete();
        await waitFor(() => {
          expect(onComplete).toBeCalledWith(validationToken, closeDelay);
        });
      });

      it.skip('skips completion page', async () => {
        withRequirements([TestAuthorizeRequirement], []);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          onComplete,
          onClose,
        });

        await identifyUserByPhone();

        await waitFor(() => {
          expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(screen.getByText('Authorize access')).toBeInTheDocument();
        });

        // Update the mock response after we entered the authorize page
        withRequirements([], []);

        await authorizeData();
        await waitFor(() => {
          expect(onComplete).toBeCalledWith(validationToken);
        });
      });

      it.skip('can onboard after filling remaining missing attributes', async () => {
        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [CollectedKycDataOption.name],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );

        withDecrypt({
          [IdDI.dob]: '05/23/1996',
          [IdDI.ssn9]: '123-45-6789',
        });

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          showCompletionPage: true,
          onComplete,
          onClose,
        });

        await identifyUserByPhone();
        await checkAdditionalDataRequired();

        await waitFor(() => {
          expect(screen.getByText('Basic Data')).toBeInTheDocument();
        });

        const firstName = screen.getByLabelText('First name');
        await userEvent.type(firstName, 'Piip');

        const lastName = screen.getByLabelText('Last name');
        await userEvent.type(lastName, 'Foot');

        const dob = screen.getByLabelText('Date of Birth');
        // Should be pre-filled since it was decrypted from api
        expect(dob).toHaveValue('05/23/1996');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await waitFor(() => {
          expect(
            screen.getByText('Confirm your personal data'),
          ).toBeInTheDocument();
        });

        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await confirmKycData();

        await waitFor(() => {
          expect(screen.getByText('Authorize access')).toBeInTheDocument();
        });
        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: true,
              missingAttributes: [],
              optionalAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await authorizeData();
        await checkComplete();
        await waitFor(() => {
          expect(onComplete).toBeCalledWith(validationToken, closeDelay);
        });
      });
    });
  });

  describe('When onboarding with a new user', () => {
    describe('When in sandbox onboarding config', () => {
      beforeEach(() => {
        const sandboxConfig = getKycOnboardingConfig();
        withOnboarding(sandboxConfig);
        withOnboardingConfig(sandboxConfig);
      });

      it.skip('starts flow on sandbox outcome page', async () => {
        renderIdv({
          showCompletionPage: true,
        });

        await waitFor(() => {
          expect(screen.getByText('Select test outcome')).toBeInTheDocument();
        });
      });
    });
  });

  describe('When there is bootstrap data', () => {
    describe('When there is partial bootstrap KYC data', () => {
      beforeEach(() => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
      });

      it('collects missing data before confirm', async () => {
        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: false,
              missingAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
              populatedAttributes: [],
              optionalAttributes: [],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );
        withUserToken();
        withIdentify(true);
        withUserVaultValidate();
        withUserVault();

        renderIdv({
          authToken: 'token',
          showCompletionPage: true,
          bootstrapData: {
            [IdDI.firstName]: 'Piip',
            [IdDI.lastName]: 'Foot',
            [IdDI.dob]: '05/23/1996',
          },
        });

        await waitFor(() => {
          expect(
            screen.getByText("What's your Social Security Number?"),
          ).toBeInTheDocument();
        });
        // Fill SSN
        const ssn = screen.getByLabelText('SSN');
        await userEvent.type(ssn, '123-45-6789');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await confirmKycData();
      });
    });

    describe('When there is bootstrap and decrypted data', () => {
      beforeEach(() => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        withUserToken();
        withIdentify(true);
        withUserVaultValidate();
        withUserVault();
        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              isMet: false,
              missingAttributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
              populatedAttributes: [CollectedKycDataOption.name],
              optionalAttributes: [],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );
      });

      it('bootstrap data takes precendence over decryption', async () => {
        withDecrypt({
          [IdDI.firstName]: 'SomeName',
          [IdDI.lastName]: 'OtherName',
        });

        renderIdv({
          authToken: 'token',
          showCompletionPage: true,
          bootstrapData: {
            [IdDI.firstName]: 'Piip',
            [IdDI.lastName]: 'Foot',
            [IdDI.dob]: '05/23/1996',
            [IdDI.ssn9]: '123-45-6789',
          },
        });

        await confirmKycData();
      });

      it('skips pages with bootstrap or decrypted data', async () => {
        withDecrypt({
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
        });

        renderIdv({
          authToken: 'token',
          showCompletionPage: true,
          bootstrapData: {
            [IdDI.dob]: '05/23/1996',
          },
        });

        await waitFor(() => {
          expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        await waitFor(() => {
          expect(
            screen.getByText("What's your Social Security Number?"),
          ).toBeInTheDocument();
        });

        // Fill in SSN
        const ssn = screen.getByLabelText('SSN');
        await userEvent.type(ssn, '123-45-6789');

        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        await confirmKycData();
      });
    });
  });

  describe('When there is a step up', () => {
    beforeEach(() => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      withUserToken();
      withIdentify(true);
      withRequirements([TestAuthorizeRequirement], []);
      withD2PGenerate();
      withOnboardingValidate('validation-token');
      withAuthorize();
    });

    it('shows the id doc step up after authorize', async () => {
      const onComplete = jest.fn();
      const onClose = jest.fn();

      renderIdv({
        authToken: 'token',
        showCompletionPage: true,
        onComplete,
        onClose,
      });

      await waitFor(() => {
        expect(screen.getByText('Authorize access')).toBeInTheDocument();
      });

      // Update the mock response after we entered the authorize page
      // For next time we are checking for requirements
      withRequirements(
        [
          {
            kind: OnboardingRequirementKind.idDoc,
            isMet: false,
            shouldCollectConsent: false,
            shouldCollectSelfie: false,
            onlyUsSupported: false,
            supportedDocumentTypes: [],
            supportedCountries: ['US', 'CA'],
          },
        ],
        [],
      );

      await authorizeData();

      await waitFor(() => {
        expect(screen.getByText('Scan or upload your ID')).toBeInTheDocument();
      });
    });
  });

  describe('When on desktop', () => {
    beforeEach(() => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      withD2PGenerate();
      withD2PStatus(D2PStatus.waiting);
    });

    it('transfers when there is a liveness requirement', async () => {
      withRequirements(
        [
          {
            kind: OnboardingRequirementKind.registerPasskey,
            isMet: false,
          },
        ],
        [],
      );

      renderIdv({
        authToken: 'token',
        showCompletionPage: true,
      });

      await waitFor(() => {
        expect(screen.getByText('Liveness check')).toBeInTheDocument();
      });
    });

    it('transfers when there is an id doc requirement', async () => {
      withRequirements(
        [
          {
            kind: OnboardingRequirementKind.idDoc,
            isMet: false,
            shouldCollectConsent: false,
            shouldCollectSelfie: false,
            onlyUsSupported: false,
            supportedDocumentTypes: [],
            supportedCountries: ['US', 'CA'],
          },
        ],
        [],
      );

      renderIdv({
        authToken: 'token',
        showCompletionPage: true,
      });

      await waitFor(() => {
        expect(screen.getByText('Scan or upload your ID')).toBeInTheDocument();
      });
    });
  });
});
