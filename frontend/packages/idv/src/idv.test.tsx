/* eslint-disable jest/expect-expect */
import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import { Layout } from '@onefootprint/idv-elements';
import { withUserVaultValidate } from '@onefootprint/idv-elements/src/plugins/investor-profile/index.test.config';
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
                    hideConfetti
                  />
                </Layout>
              </ToastProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  describe('When onboarding with an existing user vault', () => {
    describe('When onboarding to same config', () => {
      it('can one-click when given an auth token', async () => {
        const validationToken = 'validation-token';
        const closeDelay = 6000;
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        withOnboardingValidate(validationToken);
        withRequirements([], []);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          authToken: 'token',
          onComplete,
          onClose,
        });

        await checkComplete();
        expect(onComplete).toBeCalledWith(validationToken, closeDelay);

        const linkButton = screen.getByText('Return to site');
        expect(linkButton).toBeInTheDocument();
        await userEvent.click(linkButton);
        expect(onClose).toBeCalled();
      });

      it('can onboard directly after identify if already authorized', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          onComplete,
          onClose,
        });

        await identifyUserByPhone();

        const validationToken = 'validation-token';
        const closeDelay = 6000;
        withOnboardingValidate(validationToken);

        await checkComplete();
        expect(onComplete).toBeCalledWith(validationToken, closeDelay);
      });

      it('prompts user to confirm previous data when there are met requirements if redoing kyc', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          authToken: 'token',
          onComplete,
          onClose,
        });

        withUserToken();
        withIdentify(true);
        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
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
        withUserVault();

        await confirmKycData();

        const validationToken = 'validation-token';
        const closeDelay = 6000;
        withOnboardingValidate(validationToken);

        withAuthorize();
        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
            TestAuthorizeRequirement,
          ],
        );

        await authorizeData();

        await checkComplete();
        expect(onComplete).toBeCalledWith(validationToken, closeDelay);
      });
    });

    describe('When onboarding to a new config', () => {
      it('skips identify flow when provided an auth token', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        withUserToken();
        withIdentify();
        withRequirements();

        renderIdv({
          authToken: 'token',
        });

        await waitFor(() => {
          expect(screen.getByText('Basic Data')).toBeInTheDocument();
        });
      });

      it('can onboard after identify, confirm and authorize', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          onComplete,
          onClose,
        });

        await identifyUserByPhone();

        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );
        withUserToken();
        withDecrypt({
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
          [IdDI.dob]: '05/23/1996',
          [IdDI.ssn9]: '123-45-6789',
        });
        withUserVault();
        const validationToken = 'validation-token';
        const closeDelay = 6000;
        withOnboardingValidate(validationToken);

        await confirmKycData();

        withAuthorize();
        await authorizeData();

        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await checkComplete();

        expect(onComplete).toBeCalledWith(validationToken, closeDelay);
      });

      it('can onboard after filling remaining missing attributes', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);

        const onComplete = jest.fn();
        const onClose = jest.fn();

        renderIdv({
          onComplete,
          onClose,
        });

        await identifyUserByPhone();

        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [CollectedKycDataOption.name],
              populatedAttributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );

        withUserToken();
        withDecrypt({
          [IdDI.dob]: '05/23/1996',
          [IdDI.ssn9]: '123-45-6789',
        });
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

        withUserVaultValidate();
        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        withUserVault();
        const validationToken = 'validation-token';
        const closeDelay = 6000;
        withOnboardingValidate(validationToken);

        await confirmKycData();

        withRequirements(
          [TestAuthorizeRequirement],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        withAuthorize();
        await authorizeData();

        withRequirements(
          [],
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [],
              populatedAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
            },
          ],
        );

        await checkComplete();

        expect(onComplete).toBeCalledWith(validationToken, closeDelay);
      });
    });
  });

  describe('When onboarding with a new user', () => {
    describe('When in sandbox onboarding config', () => {
      it('starts flow on sandbox outcome page', async () => {
        const sandboxConfig = getKycOnboardingConfig();
        withOnboarding(sandboxConfig);
        withOnboardingConfig(sandboxConfig);

        renderIdv({});

        await waitFor(() => {
          expect(screen.getByText('Select test outcome')).toBeInTheDocument();
        });
      });
    });
  });

  describe('When there is bootstrap data', () => {
    describe('When there is partial bootstrap KYC data', () => {
      it('collects missing data before confirm', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        renderIdv({
          authToken: 'token',
          bootstrapData: {
            [IdDI.firstName]: 'Piip',
            [IdDI.lastName]: 'Foot',
            [IdDI.dob]: '05/23/1996',
          },
        });

        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [
                CollectedKycDataOption.name,
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
              populatedAttributes: [],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );
        withUserToken();
        withIdentify(true);

        await waitFor(() => {
          expect(
            screen.getByText("What's your Social Security Number?"),
          ).toBeInTheDocument();
        });
        // Fill SSN
        const ssn = screen.getByLabelText('SSN');
        await userEvent.type(ssn, '123-45-6789');

        withUserVaultValidate();
        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        withUserVault();
        await confirmKycData();
      });
    });

    describe('When there is bootstrap and decrypted data', () => {
      it('bootstrap data takes precendence over decryption', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        renderIdv({
          authToken: 'token',
          bootstrapData: {
            [IdDI.firstName]: 'Piip',
            [IdDI.lastName]: 'Foot',
            [IdDI.dob]: '05/23/1996',
            [IdDI.ssn9]: '123-45-6789',
          },
        });

        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
              populatedAttributes: [CollectedKycDataOption.name],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );
        withUserToken();
        withIdentify(true);
        withDecrypt({
          [IdDI.firstName]: 'SomeName',
          [IdDI.lastName]: 'OtherName',
        });

        withUserVault();
        await confirmKycData();
      });

      it('skips pages with bootstrap or decrypted data', async () => {
        const config = getKycOnboardingConfig(true);
        withOnboarding(config);
        withOnboardingConfig(config);
        renderIdv({
          authToken: 'token',
          bootstrapData: {
            [IdDI.dob]: '05/23/1996',
          },
        });

        withRequirements(
          [
            {
              kind: OnboardingRequirementKind.collectKycData,
              missingAttributes: [
                CollectedKycDataOption.dob,
                CollectedKycDataOption.ssn9,
              ],
              populatedAttributes: [CollectedKycDataOption.name],
            },
            TestAuthorizeRequirement,
          ],
          [],
        );
        withUserToken();
        withIdentify(true);
        withDecrypt({
          [IdDI.firstName]: 'Piip',
          [IdDI.lastName]: 'Foot',
        });

        await waitFor(() => {
          expect(
            screen.getByText("What's your Social Security Number?"),
          ).toBeInTheDocument();
        });

        // Fill in SSN
        const ssn = screen.getByLabelText('SSN');
        await userEvent.type(ssn, '123-45-6789');

        withUserVaultValidate();
        const submitButton = screen.getByRole('button', { name: 'Continue' });
        await userEvent.click(submitButton);

        withUserVault();
        await confirmKycData();
      });
    });
  });

  describe('When on desktop', () => {
    it('transfers when there is a liveness requirement', async () => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      withRequirements(
        [
          {
            kind: OnboardingRequirementKind.liveness,
          },
        ],
        [],
      );
      withD2PGenerate();
      withD2PStatus(D2PStatus.inProgress);

      renderIdv({
        authToken: 'token',
      });

      await waitFor(() => {
        expect(screen.getByText('Liveness check')).toBeInTheDocument();
      });
    });

    it('transfers when there is an id doc requirement', async () => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      renderIdv({
        authToken: 'token',
      });

      withRequirements(
        [
          {
            kind: OnboardingRequirementKind.idDoc,
            shouldCollectConsent: false,
            shouldCollectSelfie: false,
            onlyUsSupported: false,
            supportedDocumentTypes: [],
          },
        ],
        [],
      );

      withD2PGenerate();
      withD2PStatus(D2PStatus.waiting);

      await waitFor(() => {
        expect(screen.getByText('Scan or upload your ID')).toBeInTheDocument();
      });
    });
  });
});
