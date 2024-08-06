import '../../config/initializers/i18next-test';

import { createUseRouterSpy, customRender, mockRequest, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, IdDI, UserTokenScope } from '@onefootprint/types';

import { Layout } from '../layout';
import Identify from './identify';
import {
  bootstrapExistingUser,
  bootstrapExistingUserWithPasskey,
  bootstrapNewUser,
  expectShimmer,
  fillChallengePin,
  fillChallengePinExistingUser,
  fillIdentifyEmail,
  fillIdentifyPhone,
  liveOnboardingConfigFixture,
  mockGetBiometricChallengeResponse,
  noPhoneOnboardingConfigFixture,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyError,
  withIdentifyVerify,
  withKba,
  withLoginChallenge,
  withSignupChallenge,
  withUserChallenge,
  withUserChallengeVerify,
  withUserVault,
} from './identify.test.config';
import { IdentifyVariant } from './state/types';

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
    bootstrapEmail,
    bootstrapPhone,
    initialAuthToken,
    isComponentsSdk,
    config,
    device,
    onDone,
  }: {
    bootstrapEmail?: string;
    bootstrapPhone?: string;
    initialAuthToken?: string;
    isComponentsSdk?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    config: any;
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    device?: any;
    onDone?: () => void;
  }) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const bootstrapData: any = {};
    if (bootstrapEmail) {
      bootstrapData.email = bootstrapEmail;
    }
    if (bootstrapPhone) {
      bootstrapData.phoneNumber = bootstrapPhone;
    }
    return customRender(
      <Layout onClose={() => undefined}>
        <Identify
          variant={IdentifyVariant.verify}
          config={config}
          isLive={config.isLive}
          isComponentsSdk={isComponentsSdk}
          obConfigAuth={{ [CLIENT_PUBLIC_KEY_HEADER]: 'pk' }}
          bootstrapData={bootstrapEmail || bootstrapPhone ? bootstrapData : undefined}
          initialAuthToken={initialAuthToken}
          device={
            device || {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'iOS',
            }
          }
          onDone={onDone ?? (() => undefined)}
        />
      </Layout>,
    );
  };

  describe('when running a sandbox onboarding config', () => {
    beforeEach(() => {
      withIdentify();
    });

    it('proceeds to email identification when sandbox outcome was successful', async () => {
      renderIdentify({
        config: sandboxOnboardingConfigFixture,
      });

      await waitFor(() => {
        expect(screen.getByText('Enter your email to get started.')).toBeInTheDocument();
      });

      await fillIdentifyEmail();
    });
  });

  describe('When there is an initial auth token', () => {
    describe('When sufficient scopes', () => {
      beforeEach(() => {
        withIdentify({
          challengeKinds: [ChallengeKind.sms],
          tokenScopes: [UserTokenScope.signup],
        });
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

    describe('When user not found', () => {
      beforeEach(() => {
        withIdentify();
      });

      it('takes user to invalid auth token page', async () => {
        renderIdentify({
          initialAuthToken: 'token',
          config: sandboxOnboardingConfigFixture,
        });

        await waitFor(() => {
          expect(screen.getByText('The link you opened is invalid')).toBeInTheDocument();
        });
      });
    });

    describe('When error in identify', () => {
      beforeEach(() => {
        withIdentifyError();
      });

      it('takes user to invalid auth token page', async () => {
        renderIdentify({
          initialAuthToken: 'token',
          config: sandboxOnboardingConfigFixture,
        });

        await waitFor(() => {
          expect(screen.getByText('The link you opened is invalid')).toBeInTheDocument();
        });
      });
    });

    describe('When user found with insufficient scopes', () => {
      beforeEach(() => {
        mockGetBiometricChallengeResponse();
        withIdentify({});
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

  describe('When running a live onboarding config', () => {
    describe('When onboarding for API-only user', () => {
      beforeEach(() => {
        withIdentify({
          challengeKinds: [ChallengeKind.sms],
          isUnverified: true,
        });
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
        await waitFor(() => {
          expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
        });
        expect(screen.queryByText('Welcome back! 🎉')).toBeNull();
        expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();
        expect(screen.queryByText('Log in with a different account')).not.toBeInTheDocument();

        await fillChallengePin();
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });
    });

    describe('When there is bootstrap email', () => {
      describe('When user found', () => {
        beforeEach(() => {
          withIdentify({ challengeKinds: [ChallengeKind.sms] });
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapEmail: email,
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
          withIdentify();
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('prefills email', async () => {
          const email = 'piip@onefootprint.com';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapEmail: email,
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();
          await waitFor(() => {
            expect(screen.getByText('piip@onefootprint.com')).toBeInTheDocument();
          });
          await fillIdentifyPhone();

          await waitFor(() => {
            expect(screen.getByTestId('navigation-back-button')).toBeInTheDocument();
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
          withIdentify({ challengeKinds: [ChallengeKind.sms] });
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapPhone: phoneNumber,
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
          withIdentify();
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('prefills the phone', async () => {
          const phoneNumber = '+1 (234) 567-8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapPhone: phoneNumber,
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
          expect(screen.getByDisplayValue('(234) 567-8999')).toBeInTheDocument();
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
          withIdentify({});
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.biometric);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapEmail: email,
            bootstrapPhone: phoneNumber,
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
          withIdentify();
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('skips to sms challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify({
            bootstrapEmail: email,
            bootstrapPhone: phoneNumber,
            config: liveOnboardingConfigFixture,
            onDone,
          });

          await expectShimmer();

          await bootstrapNewUser(false);
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });

    describe('when the user vault is new', () => {
      beforeEach(() => {
        withIdentify();
        withSignupChallenge(ChallengeKind.sms);
        withIdentifyVerify();
        withUserChallenge();
        withUserChallengeVerify();
      });

      it('shows sms challenge page', async () => {
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          onDone,
        });

        await fillIdentifyEmail();
        await fillIdentifyPhone();
        await waitFor(() => {
          expect(screen.getByText('Verify your phone number')).toBeInTheDocument();
        });
        expect(screen.queryByText('Log in with a different account')).not.toBeInTheDocument();
        expect(screen.getByTestId('navigation-back-button')).toBeInTheDocument();

        await fillChallengePin();
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });

      it('can resend sms challenge', async () => {
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          onDone,
        });

        await fillIdentifyEmail();
        await fillIdentifyPhone();

        // Wait until the login challenge request succeeds
        await waitFor(() => {
          expect(screen.getByRole('presentation')).toHaveAttribute('data-pending', 'false');
        });
        await userEvent.click(screen.getByText('Resend code'));
        await waitFor(() => {
          expect(screen.getByText('We sent you a new code.')).toBeInTheDocument();
        });
      });
    });

    describe('when the user is missing a phone auth method', () => {
      beforeEach(() => {
        withIdentify({ challengeKinds: [ChallengeKind.email] });
        withLoginChallenge(ChallengeKind.email);
        withIdentifyVerify();
        withUserChallenge();
        withUserChallengeVerify();
      });

      it('requires registering phone number', async () => {
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          onDone,
        });

        await fillIdentifyEmail();
        await fillChallengePinExistingUser();

        await waitFor(() => {
          expect(screen.getByText('Add a phone number')).toBeInTheDocument();
        });
        expect(screen.getByText('Enter your phone number to proceed.')).toBeInTheDocument();
        expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();

        await fillIdentifyPhone();
        await fillChallengePin();

        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
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
          withIdentify({ challengeKinds: [ChallengeKind.email] });
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
            bootstrapEmail: email,
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
            expect(screen.getByRole('presentation')).toHaveAttribute('data-pending', 'false');
          });
          await userEvent.click(screen.getByText('Resend code'));
          await waitFor(() => {
            expect(screen.getByText('We sent you a new code.')).toBeInTheDocument();
          });
        });
      });

      describe('when other challenges are available', () => {
        beforeEach(() => {
          withIdentify({ challengeKinds: [ChallengeKind.email] });
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
            bootstrapEmail: email,
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
            expect(screen.getByRole('presentation')).toHaveAttribute('data-pending', 'false');
          });
          await userEvent.click(screen.getByText('Resend code'));
          await waitFor(() => {
            expect(screen.getByText('We sent you a new code.')).toBeInTheDocument();
          });
        });
      });
    });

    describe('when the user vault is new', () => {
      beforeEach(() => {
        withIdentify();
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
        await waitFor(() => {
          expect(screen.getByText('Verify your email address')).toBeInTheDocument();
        });
        expect(screen.queryByText('Log in with a different account')).not.toBeInTheDocument();
        await fillChallengePin();
        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });

      it('can bootstrap', async () => {
        const onDone = jest.fn();
        const email = 'piip@onefootprint.com';
        renderIdentify({
          bootstrapEmail: email,
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
          expect(screen.getByRole('presentation')).toHaveAttribute('data-pending', 'false');
        });
        await userEvent.click(screen.getByText('Resend code'));
        await waitFor(() => {
          expect(screen.getByText('We sent you a new code.')).toBeInTheDocument();
        });
      });
    });
  });

  describe('when has multiple challenge options', () => {
    beforeEach(() => {
      withIdentify({
        challengeKinds: [ChallengeKind.email, ChallengeKind.sms, ChallengeKind.biometric],
        matchingFps: [IdDI.email],
      });
      withIdentifyVerify();
    });

    it('can perform sms challenge', async () => {
      withLoginChallenge(ChallengeKind.sms);
      const onDone = jest.fn();
      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyEmail();
      await waitFor(() => {
        expect(screen.getByText('Log in using one of the options below.')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('••99', { exact: false }));
      await userEvent.click(screen.getByText('Continue'));
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });

    it('can perform email challenge', async () => {
      withLoginChallenge(ChallengeKind.email);
      const onDone = jest.fn();
      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyEmail();
      await waitFor(() => {
        expect(screen.getByText('Log in using one of the options below.')).toBeInTheDocument();
      });
      await userEvent.click(
        screen.getByText('piip@onefootprint.com'), // Send code to <span data-dd-privacy="mask">piip@onefootprint.com</span>
      );
      await userEvent.click(screen.getByText('Continue'));
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });

    it('can perform passkey challenge', async () => {
      mockGetBiometricChallengeResponse();
      withLoginChallenge(ChallengeKind.biometric);
      const onDone = jest.fn();
      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyEmail();
      await waitFor(() => {
        expect(screen.getByText('Log in using one of the options below.')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Log in with passkey'));
      await userEvent.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });

    describe('device doesnt support passkey', () => {
      it('passkey is hidden on challenge selector screen', async () => {
        withLoginChallenge(ChallengeKind.sms);
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          device: {
            type: 'desktop',
            hasSupportForWebauthn: false,
            osName: 'windows vista',
          },
          onDone,
        });

        await fillIdentifyEmail();
        await waitFor(() => {
          expect(screen.getByText('Log in using one of the options below.')).toBeInTheDocument();
        });
        expect(screen.queryByText('Log in with passkey')).not.toBeInTheDocument();
        await userEvent.click(screen.getByText('••99', { exact: false }));
        await userEvent.click(screen.getByText('Continue'));
        await fillChallengePin();

        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });

      it('skip straight to sms challenge when it is the only one available', async () => {
        withIdentify({
          challengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
        });
        withLoginChallenge(ChallengeKind.sms);
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          device: {
            type: 'desktop',
            hasSupportForWebauthn: false,
            osName: 'windows vista',
          },
          onDone,
        });

        await fillIdentifyEmail();
        // Since passkey isn't available on this device, we'll skip the challenge selector screen
        // and go straight to the SMS challenge screen
        await waitFor(() => {
          expect(screen.getByText('Welcome back! 🎉')).toBeInTheDocument();
        });
        await fillChallengePin();

        await waitFor(() => {
          expect(onDone).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when bootstrapping data', () => {
    beforeEach(() => {
      withIdentify();
      withSignupChallenge(ChallengeKind.sms);
      withIdentifyVerify();
    });

    it('invalid bootstrap email, email is recollected', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'flarp',
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyEmail();
      await fillIdentifyPhone();
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalledWith({
          authToken: 'new-token',
          email: {
            value: 'piip@onefootprint.com',
            isBootstrap: false,
          },
          phoneNumber: {
            value: '+1 (650) 460-0799',
            isBootstrap: false,
          },
        });
      });
    });

    it('invalid bootstrap phone, phone is recollected', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'piip@onefootprint.com',
        bootstrapPhone: 'flarp',
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyPhone();
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalledWith({
          authToken: 'new-token',
          email: {
            value: 'piip@onefootprint.com',
            isBootstrap: true,
          },
          phoneNumber: {
            value: '+1 (650) 460-0799',
            isBootstrap: false,
          },
        });
      });
    });

    it('invalid bootstrap email and phone, both recollected', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'flarp',
        bootstrapPhone: 'flarp',
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillIdentifyEmail();
      await fillIdentifyPhone();
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalledWith({
          authToken: 'new-token',
          email: {
            value: 'piip@onefootprint.com',
            isBootstrap: false,
          },
          phoneNumber: {
            value: '+1 (650) 460-0799',
            isBootstrap: false,
          },
        });
      });
    });

    it('valid bootstrap phone and email, goes to SMS challenge', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'piip@onefootprint.com',
        bootstrapPhone: '+16504600799',
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalledWith({
          authToken: 'new-token',
          email: {
            value: 'piip@onefootprint.com',
            isBootstrap: true,
          },
          phoneNumber: {
            // TODO should we format the bootstrap phone passed in?
            value: '+16504600799',
            isBootstrap: true,
          },
        });
      });
    });
  });

  describe('when user has unverified email', () => {
    beforeEach(() => {
      mockRequest({
        method: 'post',
        path: '/hosted/identify',
        response: {
          user: {
            token: 'utok_xxx',
            isUnverified: false,
            availableChallengeKinds: ['sms'],
            authMethods: [
              {
                kind: 'phone',
                isVerified: true,
              },
              {
                kind: 'email',
                isVerified: false,
              },
            ],
            scrubbedPhone: '+1 (***) ***-**00',
            tokenScopes: [],
            matchingFps: [IdDI.email],
          },
        },
      });

      withLoginChallenge(ChallengeKind.sms);
      withIdentifyVerify();
      withKba();
    });

    it('can log in with unverified email after kba', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'sandbox@onefootprint.com',
        config: liveOnboardingConfigFixture,
        onDone,
      });

      await waitFor(() => {
        expect(screen.getByText('Send code to email instead')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Send code to email instead'));
      const inputPhone = screen.getByText('Phone number');
      await waitFor(() => {
        expect(
          screen.getByText(
            'Before we can send a code to your email, please confirm your full phone number ending in ••00',
          ),
        ).toBeInTheDocument();
      });
      await userEvent.type(inputPhone, '6504600799');
      await userEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to sandbox@onefootprint.com.')).toBeInTheDocument();
      });
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });

  describe('when using components SDK', () => {
    it('sends x-fp-is-components-sdk header in signup challenge', async () => {
      withIdentify();
      const onSignupChallengeCalled = jest.fn();
      withSignupChallenge(undefined, onSignupChallengeCalled);
      withIdentifyVerify();

      const onDone = jest.fn();
      // Bootstrap email, enter phone explicitly
      renderIdentify({
        bootstrapEmail: 'sandbox@onefootprint.com',
        config: liveOnboardingConfigFixture,
        isComponentsSdk: true,
        onDone,
      });

      await fillIdentifyPhone();
      await fillChallengePin();

      const { body, headers } = onSignupChallengeCalled.mock.calls[0][0];
      expect(body).toEqual({
        scope: 'onboarding',
        challenge_kind: 'sms',
        email: {
          value: 'sandbox@onefootprint.com',
          is_bootstrap: true,
        },
        phone_number: {
          value: '+1 (650) 460-0799',
          is_bootstrap: false,
        },
      });
      expect(headers['x-fp-is-components-sdk']).toEqual('true');

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
