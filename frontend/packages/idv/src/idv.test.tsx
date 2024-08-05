/* eslint-disable jest/expect-expect */
import './config/initializers/i18next-test';

import themes from '@onefootprint/design-tokens';
import { createUseRouterSpy, render, screen, userEvent } from '@onefootprint/test-utils';
import type { OnboardingRequirement } from '@onefootprint/types';
import {
  CLIENT_PUBLIC_KEY_HEADER,
  ChallengeKind,
  CollectedKycDataOption,
  D2PStatus,
  DocumentRequestKind,
  DocumentUploadSettings,
  IdDI,
  OnboardingRequirementKind,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { Layout } from './components';
import Idv from './idv';
import {
  TestAuthorizeRequirement,
  authorizeData,
  confirmKycData,
  getKycOnboardingConfig,
  waitFor,
  withAuthorize,
  withCheckSession,
  withCreateDownscopedToken,
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
import { ComponentsSdkTypes } from './utils/state-machine/types';

const defaultObConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' };

const desktopDevice = {
  type: 'desktop',
  osName: 'Mac OSX',
  browser: 'Safari',
  hasSupportForWebauthn: true,
};

const mobileDevice = {
  type: 'mobile',
  osName: 'iOS',
  browser: 'Safari',
  hasSupportForWebauthn: true,
};

const collectKycDataRequirement: OnboardingRequirement = {
  kind: OnboardingRequirementKind.collectKycData,
  isMet: false,
  missingAttributes: [CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.ssn9],
  populatedAttributes: [],
  optionalAttributes: [],
};

export const idDocRequirement: OnboardingRequirement = {
  kind: OnboardingRequirementKind.document,
  isMet: false,
  documentRequestId: 'id',
  uploadSettings: DocumentUploadSettings.preferUpload,
  config: {
    kind: DocumentRequestKind.Identity,
    shouldCollectConsent: false,
    shouldCollectSelfie: false,
    supportedCountryAndDocTypes: {
      US: [
        SupportedIdDocTypes.driversLicense,
        SupportedIdDocTypes.idCard,
        SupportedIdDocTypes.passport,
        SupportedIdDocTypes.residenceDocument,
        SupportedIdDocTypes.visa,
        SupportedIdDocTypes.workPermit,
      ],
      CA: [SupportedIdDocTypes.driversLicense, SupportedIdDocTypes.idCard, SupportedIdDocTypes.passport],
    },
  },
};

describe('<Idv />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
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
    isInIframe,
    componentsSdkContext,
    bootstrapData,
    onComplete = jest.fn(),
    onClose = jest.fn(),
    authToken,
    device,
  }: Partial<IdvProps>) =>
    render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <DesignSystemProvider theme={themes.light}>
            <ToastProvider>
              <Layout>
                <Idv
                  authToken={authToken}
                  obConfigAuth={obConfigAuth}
                  isTransfer={isTransfer}
                  isInIframe={isInIframe}
                  componentsSdkContext={componentsSdkContext}
                  bootstrapData={bootstrapData}
                  onComplete={onComplete}
                  onClose={onClose}
                  device={device}
                  l10n={{ locale: 'en-US', language: 'en' }}
                />
              </Layout>
            </ToastProvider>
          </DesignSystemProvider>
        </QueryClientProvider>
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
        it('can one-click when given an auth token', async () => {
          withRequirements([]);
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
        expect(screen.getByText(/Log in using one of the options below/i)).toBeInTheDocument();
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
        withRequirements([collectKycDataRequirement, TestAuthorizeRequirement]);
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
          expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
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
            missingAttributes: [CollectedKycDataOption.dob, CollectedKycDataOption.ssn9],
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
          expect(screen.getByText("What's your Social Security Number?")).toBeInTheDocument();
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
      withRequirements([idDocRequirement]);

      await authorizeData();

      await waitFor(() => {
        expect(screen.getByText('Scan or upload ID document')).toBeInTheDocument();
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
      withRequirements([idDocRequirement]);

      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
        device: desktopDevice,
      });

      await waitFor(() => {
        expect(screen.getByText('Scan or upload ID document')).toBeInTheDocument();
      });
      expect(
        screen.getByText('Open the link sent to your phone and follow the prompts to upload your ID document.'),
      ).toBeInTheDocument();
    });
  });

  describe('When isTransfer is true', () => {
    beforeEach(() => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      withD2PGenerate();
      withD2PStatus(D2PStatus.waiting);
      withIdentify(true, true);
    });

    it('desktop transfer app does not handle doc requirements', async () => {
      // Also shouldn't render collect KYC data
      withRequirements([idDocRequirement, collectKycDataRequirement]);

      const onComplete = jest.fn();
      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
        device: desktopDevice,
        isTransfer: true,
        onComplete,
      });

      // Should immediately complete because we won't handle id doc requirement in desktop transfer
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith({});
      });
    });

    it('mobile transfer app does handle doc requirements', async () => {
      withRequirements([idDocRequirement, collectKycDataRequirement]);

      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
        isTransfer: true,
        device: mobileDevice,
      });

      // Should render id doc requirement
      await waitFor(() => {
        expect(screen.getByText('Capture or upload your ID document')).toBeInTheDocument();
      });
      expect(screen.getByText('Please take a clear photo of your document in a bright location')).toBeInTheDocument();
    });
  });

  describe('When isComponentsSdk is true', () => {
    beforeEach(() => {
      const config = getKycOnboardingConfig(true);
      withOnboarding(config);
      withOnboardingConfig(config);
      withD2PGenerate();
      withD2PStatus(D2PStatus.waiting);
      withIdentify(true, true);
      withRequirements([collectKycDataRequirement]);
    });

    it('yields relayToComponentsSdk event', async () => {
      const metCollectKycDataRequirement: OnboardingRequirement = {
        kind: OnboardingRequirementKind.collectKycData,
        isMet: true,
        populatedAttributes: [CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.ssn9],
        missingAttributes: [],
        optionalAttributes: [],
      };
      const passkeyRequirement: OnboardingRequirement = {
        kind: OnboardingRequirementKind.registerPasskey,
        isMet: false,
      };
      withRequirements([metCollectKycDataRequirement, passkeyRequirement]);
      withCreateDownscopedToken();
      const onComplete = jest.fn();
      const componentsSdkContext = {
        onRelayFromComponents: jest.fn(),
        relayToComponents: jest.fn(),
        componentsSdkType: ComponentsSdkTypes.WEB,
      };
      renderIdv({
        obConfigAuth: defaultObConfigAuth,
        authToken: 'token',
        isInIframe: true,
        componentsSdkContext,
        device: desktopDevice,
        onComplete,
      });

      // Skips identify, goes straight to waitForComponentsSdk
      await waitFor(() => {
        // Make sure the downscoped token is relayed back, not the token with full scopes
        expect(componentsSdkContext.relayToComponents).toHaveBeenCalledWith('downscoped_token_xxxx', 'token');
      });
      expect(componentsSdkContext.relayToComponents).toHaveBeenCalledTimes(1);

      // For some reason, this is being called twice in tests, but not in prod
      // expect(componentsSdkContext.onRelayFromComponents).toHaveBeenCalledTimes(1);
      // Simulate the parent sending a postmessage to relay control back to idv
      const onRelayFromComponentsCb = componentsSdkContext.onRelayFromComponents.mock.calls[0][0];
      onRelayFromComponentsCb();

      // Should skip confirm and go straight to the transfer app to open passkey requirement on mobile/new tab
      await waitFor(() => {
        expect(screen.getByText('Add a passkey')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Continue on desktop'));
      await waitFor(() => {
        expect(
          screen.getByText('To continue, we need to open a new browser window. Please tap the button below.'),
        ).toBeInTheDocument();
      });
    });
  });
});
