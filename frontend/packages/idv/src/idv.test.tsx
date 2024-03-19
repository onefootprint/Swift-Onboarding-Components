/* eslint-disable jest/expect-expect */
import './config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  render,
  screen,
  userEvent,
} from '@onefootprint/test-utils';
import {
  ChallengeKind,
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  D2PStatus,
  IdDI,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';

import { Layout } from './components';
import Idv from './idv';
import {
  authorizeData,
  confirmKycData,
  getKycOnboardingConfig,
  TestAuthorizeRequirement,
  waitFor,
  withAuthorize,
  withCheckSession,
  withD2PGenerate,
  withD2PStatus,
  withDecrypt,
  withIdentify,
  withIdentifyVerify,
  withLoginChallenge,
  withOnboarding,
  withOnboardingConfig,
  withOnboardingValidate,
  withRequirements,
  withUserVault,
} from './idv.test.config';
import type { IdvProps } from './types';

const defaultObConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' };

describe('<Idv />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: { log: () => {}, warn: () => {}, error: () => {} },
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
    useRouterSpy({ pathname: '/', query: {} });
    withCheckSession();
  });

  const testDeviceWithPasskey = {
    osName: 'android',
    browser: 'browser',
    type: 'mobile',
    hasSupportForWebauthn: true,
  };

  const renderIdv = ({
    obConfigAuth = undefined,
    isTransfer = false,
    bootstrapData,
    onComplete = jest.fn(),
    onClose = jest.fn(),
    authToken,
    device,
  }: Partial<IdvProps>) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.footprint.light}>
              <ToastProvider>
                <Layout>
                  <Idv
                    authToken={authToken}
                    obConfigAuth={obConfigAuth}
                    isTransfer={isTransfer}
                    bootstrapData={bootstrapData}
                    onComplete={onComplete}
                    onClose={onClose}
                    device={device}
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

    beforeEach(() => {
      withOnboarding(config);
      withOnboardingConfig(config);
      withOnboardingValidate(validationToken);
    });

    describe('When onboarding to same config', () => {
      describe('When there are empty requirements', () => {
        beforeEach(() => {
          withRequirements([]);
        });

        it('can one-click when given an auth token', async () => {
          withIdentify(true, true);
          const onComplete = jest.fn();
          const onClose = jest.fn();

          renderIdv({
            obConfigAuth: defaultObConfigAuth,
            authToken: 'token',
            onComplete,
            onClose,
          });

          await waitFor(() => {
            expect(onComplete).toHaveBeenCalledWith({
              validationToken,
              deviceResponseJson: undefined,
              authToken: 'token',
            });
          });
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

      it('starts flow on sandbox outcome page', async () => {
        renderIdv({
          obConfigAuth: defaultObConfigAuth,
        });

        await waitFor(() => {
          expect(screen.getByText('Test outcomes')).toBeInTheDocument();
        });
        await userEvent.click(screen.getByText('Continue'));
      });
    });
  });

  describe('When initialized with an auth token', () => {
    beforeEach(() => {
      withUserVault();
      withAuthorize();
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
    });

    it('skips identify flow when provided an auth token with proper scope', async () => {
      withIdentify(true, true);
      withRequirements();

      renderIdv({
        authToken: 'token',
      });

      await waitFor(() => {
        expect(screen.getByText('Basic Data')).toBeInTheDocument();
      });
    });

    it('goes through identify flow when provided an auth token with insufficient scopes', async () => {
      withIdentify(true);
      withLoginChallenge(ChallengeKind.sms);
      withIdentifyVerify();

      renderIdv({
        authToken: 'token',
        device: testDeviceWithPasskey,
      });

      await waitFor(() => {
        expect(
          screen.getByText(/Log in using one of the options below/i),
        ).toBeInTheDocument();
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
        withRequirements([
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
        ]);
        withIdentify(true, true);
        withUserVault();

        renderIdv({
          obConfigAuth: defaultObConfigAuth,
          authToken: 'token',
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
        withIdentify(true, true);
        withUserVault();
        withRequirements([
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
        ]);
      });

      it('bootstrap data takes precendence over decryption', async () => {
        withDecrypt({
          [IdDI.firstName]: 'SomeName',
          [IdDI.lastName]: 'OtherName',
        });

        renderIdv({
          obConfigAuth: defaultObConfigAuth,
          authToken: 'token',
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
          obConfigAuth: defaultObConfigAuth,
          authToken: 'token',
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
      withIdentify(true, true);
      withRequirements([TestAuthorizeRequirement]);
      withD2PGenerate();
      withOnboardingValidate('validation-token');
      withAuthorize();
    });

    it('shows the id doc step up after authorize', async () => {
      const onComplete = jest.fn();
      const onClose = jest.fn();

      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
        onComplete,
        onClose,
      });

      await waitFor(() => {
        expect(screen.getByText('Authorize access')).toBeInTheDocument();
      });

      // Update the mock response after we entered the authorize page
      // For next time we are checking for requirements
      withRequirements([
        {
          kind: OnboardingRequirementKind.idDoc,
          isMet: false,
          shouldCollectConsent: false,
          shouldCollectSelfie: false,
          uploadMode: 'allow_upload',
          supportedCountryAndDocTypes: {
            us: [
              SupportedIdDocTypes.driversLicense,
              SupportedIdDocTypes.idCard,
              SupportedIdDocTypes.passport,
              SupportedIdDocTypes.residenceDocument,
              SupportedIdDocTypes.visa,
              SupportedIdDocTypes.workPermit,
            ],
            ca: [
              SupportedIdDocTypes.driversLicense,
              SupportedIdDocTypes.idCard,
              SupportedIdDocTypes.passport,
            ],
          },
        },
      ]);

      await authorizeData();

      await waitFor(() => {
        expect(
          screen.getByText('Scan or upload ID document'),
        ).toBeInTheDocument();
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
      withIdentify(true, true);
    });

    it('transfers when there is an id doc requirement', async () => {
      withRequirements([
        {
          kind: OnboardingRequirementKind.idDoc,
          isMet: false,
          shouldCollectConsent: false,
          shouldCollectSelfie: false,
          uploadMode: 'allow_upload',
          supportedCountryAndDocTypes: {
            us: [
              SupportedIdDocTypes.driversLicense,
              SupportedIdDocTypes.idCard,
              SupportedIdDocTypes.passport,
              SupportedIdDocTypes.residenceDocument,
              SupportedIdDocTypes.visa,
              SupportedIdDocTypes.workPermit,
            ],
            ca: [
              SupportedIdDocTypes.driversLicense,
              SupportedIdDocTypes.idCard,
              SupportedIdDocTypes.passport,
            ],
          },
        },
      ]);

      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
      });

      await waitFor(() => {
        expect(
          screen.getByText('Scan or upload ID document'),
        ).toBeInTheDocument();
      });
    });
  });
});
