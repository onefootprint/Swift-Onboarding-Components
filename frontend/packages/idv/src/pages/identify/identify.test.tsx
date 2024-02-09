import '../../config/initializers/i18next-test';

import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { ChallengeKind, CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import * as React from 'react';

import { Layout } from '../../components/layout';
import Identify from './identify';
import {
  bootstrapExistingUser,
  bootstrapExistingUserWithPasskey,
  bootstrapNewUser,
  expectShimmer,
  fillChallengePin,
  fillIdentifyEmail,
  fillIdentifyPhone,
  liveOnboardingConfigFixture,
  mockGetBiometricChallengeResponse,
  noPhoneOnboardingConfigFixture,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyVerify,
  withLoginChallenge,
  withSignupChallenge,
  withUserTokenInsufficientScopes,
  withUserTokenSufficientScopes,
  withUserVault,
} from './identify.test.config';

jest.mock('../../utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../../utils/get-biometric-challenge-response'),
}));

const useRouterSpy = createUseRouterSpy();

describe('<Identify />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/',
      query: {},
    });
  });

  const renderIdentify = ({
    bootstrapData,
    initialAuthToken,
    config,
    onDone,
  }: {
    bootstrapData?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    initialAuthToken?: string;
    obConfigAuth?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    config: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onDone?: () => void;
  }) => {
    customRender(
      <ObserveCollectorProvider appName="bifrost">
        <Layout onClose={() => {}}>
          <Identify
            config={config}
            device={{
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'iOS',
            }}
            obConfigAuth={{ [CLIENT_PUBLIC_KEY_HEADER]: 'pk' }}
            bootstrapData={bootstrapData ?? {}}
            initialAuthToken={initialAuthToken}
            onDone={onDone ?? (() => {})}
          />
        </Layout>
      </ObserveCollectorProvider>,
    );
  };

  describe('when running a sandbox onboarding config', () => {
    beforeEach(() => {
      withIdentify(false);
    });

    it('proceeds to email identification when sandbox outcome was successful', async () => {
      renderIdentify({
        config: sandboxOnboardingConfigFixture,
      });

      await waitFor(() => {
        expect(
          screen.getByText('Enter your email to get started.'),
        ).toBeInTheDocument();
      });

      await fillIdentifyEmail();
    });
  });

  describe('When there is an initial auth token', () => {
    describe('When sufficient scopes', () => {
      beforeEach(() => {
        withUserTokenSufficientScopes();
      });

      it('identify machine finishes without challenge', async () => {
        const onDone = jest.fn();
        renderIdentify({
          initialAuthToken: 'token',
          onDone,
          config: sandboxOnboardingConfigFixture,
        });

        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });
    });

    describe('When insufficient scopes', () => {
      beforeEach(() => {
        withUserTokenInsufficientScopes();
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false);
        });

        it('takes user to invalid auth token page', async () => {
          renderIdentify({
            initialAuthToken: 'token',
            config: sandboxOnboardingConfigFixture,
          });

          await waitFor(() => {
            expect(
              screen.getByText('The link you opened is invalid'),
            ).toBeInTheDocument();
          });
        });
      });

      describe('When user found', () => {
        beforeEach(() => {
          mockGetBiometricChallengeResponse();
          withIdentify(true);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.biometric);
        });

        it('takes user to challenge', async () => {
          const onDone = jest.fn();

          renderIdentify({
            initialAuthToken: 'token',
            config: sandboxOnboardingConfigFixture,
            onDone,
          });

          await bootstrapExistingUserWithPasskey();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('When running a live onboarding config', () => {
    describe('When onboarding for API-only user', () => {
      beforeEach(() => {
        withIdentify(true, [ChallengeKind.sms], true);
        withUserTokenInsufficientScopes();
        withIdentifyVerify();
        withLoginChallenge(ChallengeKind.sms);
      });

      it('initiates a step up challenge using SMS', async () => {
        const authToken = 'tok_1234';
        const onDone = jest.fn();

        renderIdentify({
          initialAuthToken: authToken,
          config: liveOnboardingConfigFixture,
          onDone,
        });

        await expectShimmer();
        await bootstrapNewUser();
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });
    });

    describe('When there is bootstrap email', () => {
      describe('When user found', () => {
        beforeEach(() => {
          withIdentify(true, [ChallengeKind.sms]);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              email,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await bootstrapExistingUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false, []);
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('prefills email', async () => {
          const email = 'piip@onefootprint.com';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              email,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await waitFor(() => {
            expect(
              screen.getByText('piip@onefootprint.com'),
            ).toBeInTheDocument();
          });
          await fillIdentifyPhone();

          await waitFor(() => {
            expect(
              screen.getByTestId('navigation-back-button'),
            ).toBeInTheDocument();
          });
          await fillChallengePin();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });

    describe('When there is bootstrap phone', () => {
      describe('When user found', () => {
        beforeEach(() => {
          withIdentify(true, [ChallengeKind.sms]);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              phoneNumber,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await bootstrapExistingUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false, []);
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('prefills the phone', async () => {
          const phoneNumber = '+1 (234) 567-8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              phoneNumber,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await waitFor(() => {
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
          });
          const emailField = screen.getByLabelText('Email');
          await userEvent.type(emailField, 'piip@onefootprint.com');
          await userEvent.click(screen.getByText('Continue'));

          await waitFor(() => {
            expect(screen.getByText('Phone number')).toBeInTheDocument();
          });
          expect(
            screen.getByDisplayValue('(234) 567-8999'),
          ).toBeInTheDocument();
          await userEvent.click(screen.getByText('Verify with SMS'));

          await fillChallengePin();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });

    describe('When there is bootstrap email and phone', () => {
      describe('When user found', () => {
        beforeEach(() => {
          mockGetBiometricChallengeResponse();
          withIdentify(true);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.biometric);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              email,
              phoneNumber,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await bootstrapExistingUserWithPasskey();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false, []);
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('skips to sms challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapData: {
              email,
              phoneNumber,
            },
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await bootstrapNewUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('when running a no phone onboarding config', () => {
    describe('when there is an existing user vault', () => {
      beforeEach(() => {
        withIdentifyVerify();
      });

      describe('when only email challenge is available', () => {
        beforeEach(() => {
          withIdentify(true, [ChallengeKind.email]);
          withLoginChallenge(ChallengeKind.email);
        });

        it('shows email challenge page', async () => {
          const onDone = jest.fn();
          renderIdentify({
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await fillIdentifyEmail();
          await fillChallengePin();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });

        it('can bootstrap', async () => {
          const onDone = jest.fn();
          const email = 'piip@onefootprint.com';
          renderIdentify({
            bootstrapData: { email },
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await bootstrapExistingUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });

        it('can resend email challenge', async () => {
          const onDone = jest.fn();
          renderIdentify({
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await fillIdentifyEmail();

          // Wait until the login challenge request succeeds
          await waitFor(() => {
            expect(screen.getByRole('presentation')).toHaveAttribute(
              'data-pending',
              'false',
            );
          });
          await userEvent.click(screen.getByText('Resend code'));
          await waitFor(() => {
            expect(
              screen.getByText('We sent you a new code.'),
            ).toBeInTheDocument();
          });
        });
      });

      describe('when other challenges are available', () => {
        beforeEach(() => {
          withIdentify(true, [ChallengeKind.sms]);
          withLoginChallenge(ChallengeKind.sms);
        });

        it('shows sms challenge page', async () => {
          const onDone = jest.fn();
          renderIdentify({
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await fillIdentifyEmail();
          await fillChallengePin();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });

        it('can bootstrap', async () => {
          const onDone = jest.fn();
          const email = 'piip@onefootprint.com';
          renderIdentify({
            bootstrapData: { email },
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await bootstrapExistingUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });

        it('can resend sms challenge', async () => {
          const onDone = jest.fn();
          renderIdentify({
            config: noPhoneOnboardingConfigFixture,
            onDone,
          });

          await fillIdentifyEmail();

          // Wait until the login challenge request succeeds
          await waitFor(() => {
            expect(screen.getByRole('presentation')).toHaveAttribute(
              'data-pending',
              'false',
            );
          });
          await userEvent.click(screen.getByText('Resend code'));
          await waitFor(() => {
            expect(
              screen.getByText('We sent you a new code.'),
            ).toBeInTheDocument();
          });
        });
      });
    });

    describe('when the user vault is new', () => {
      beforeEach(() => {
        withIdentify(false, []);
        withSignupChallenge(ChallengeKind.email);
        withIdentifyVerify();
      });

      it('shows email challenge page', async () => {
        const onDone = jest.fn();
        renderIdentify({
          config: noPhoneOnboardingConfigFixture,
          onDone,
        });

        await fillIdentifyEmail();
        await fillChallengePin();
        await waitFor(() => {
          expect(screen.getByText('Success!')).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });

      it('can bootstrap', async () => {
        const onDone = jest.fn();
        const email = 'piip@onefootprint.com';
        renderIdentify({
          bootstrapData: { email },
          config: noPhoneOnboardingConfigFixture,
          onDone,
        });

        await bootstrapNewUser(true);
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });

      it('can resend email challenge', async () => {
        const onDone = jest.fn();
        renderIdentify({
          config: noPhoneOnboardingConfigFixture,
          onDone,
        });

        await fillIdentifyEmail();

        // Wait until the login challenge request succeeds
        await waitFor(() => {
          expect(screen.getByRole('presentation')).toHaveAttribute(
            'data-pending',
            'false',
          );
        });
        await userEvent.click(screen.getByText('Resend code'));
        await waitFor(() => {
          expect(
            screen.getByText('We sent you a new code.'),
          ).toBeInTheDocument();
        });
      });
    });
  });
});
