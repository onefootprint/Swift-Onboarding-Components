import '../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { AuthMethodKind, CLIENT_PUBLIC_KEY_HEADER, ChallengeKind, IdDI } from '@onefootprint/types';
import mockRouter from 'next-router-mock';

import type { ComponentProps } from 'react';
import { Layout } from '../../../layout';
import IdentifyLogin from './identify-login';
import {
  bootstrapExistingUser,
  fillChallengePin,
  fillChallengePinExistingUser,
  fillIdentifyEmail,
  fillIdentifyPhone,
  liveOnboardingConfigFixture,
  mockGetBiometricChallengeResponse,
  noPhoneOnboardingConfigFixture,
  user,
  withIdentifyVerify,
  withKba,
  withLoginChallenge,
  withUserChallenge,
  withUserChallengeVerify,
} from './identify-login.test.config';
import { type IdentifyContext, IdentifyVariant } from './state/types';

type Config = ComponentProps<typeof IdentifyLogin>['machineArgs']['config'];
type Device = ComponentProps<typeof IdentifyLogin>['machineArgs']['device'];

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

jest.mock('../../../../utils/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../utils/get-biometric-challenge-response'),
}));

describe('<IdentifyLogin />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  const renderIdentify = ({
    bootstrapEmail,
    bootstrapPhone,
    isComponentsSdk,
    config,
    device,
    onDone,
    onBack,
    handleReset,
    user,
  }: {
    bootstrapEmail?: string;
    bootstrapPhone?: string;
    isComponentsSdk?: boolean;
    config: Config;
    device?: Device;
    onDone?: () => void;
    onBack?: () => void;
    handleReset?: () => void;
    user: IdentifyContext['user'];
  }) => {
    return customRender(
      <Layout onClose={() => undefined}>
        <IdentifyLogin
          machineArgs={{
            variant: IdentifyVariant.verify,
            config,
            isLive: Boolean(config?.isLive),
            isComponentsSdk,
            obConfigAuth: { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' },
            email: bootstrapEmail ? { value: bootstrapEmail, isBootstrap: true } : undefined,
            phoneNumber: bootstrapPhone ? { value: bootstrapPhone, isBootstrap: true } : undefined,
            device: device || {
              type: 'mobile',
              hasSupportForWebauthn: true,
              osName: 'iOS',
              browser: 'Safari',
            },
            identify: { user, identifyToken: 'utok' },
          }}
          onDone={onDone ?? (() => undefined)}
          onBack={onBack}
          handleReset={handleReset ?? (() => undefined)}
        />
      </Layout>,
    );
  };

  describe('When onboarding for API-only user', () => {
    beforeEach(() => {
      withIdentifyVerify();
      withLoginChallenge(ChallengeKind.sms);
    });

    it('initiates a step up challenge using SMS', async () => {
      const onDone = jest.fn();

      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
        user: user({
          challengeKinds: [ChallengeKind.sms],
          isUnverified: true,
        }),
      });

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

  describe('When user found', () => {
    beforeEach(() => {
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
        user: user({ challengeKinds: [ChallengeKind.sms] }),
      });

      await bootstrapExistingUser();
      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });

  describe('when the user is missing a phone auth method', () => {
    beforeEach(() => {
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
        user: user({ challengeKinds: [ChallengeKind.email] }),
        onBack: () => undefined,
      });

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

  describe('when the user is missing an email auth method', () => {
    beforeEach(() => {
      withLoginChallenge(ChallengeKind.sms);
      withIdentifyVerify();
      withUserChallenge();
      withUserChallengeVerify();
    });

    it('collects and verifies email', async () => {
      withIdentifyVerify();
      const onDone = jest.fn();
      renderIdentify({
        config: noPhoneOnboardingConfigFixture,
        onDone,
        user: user({ challengeKinds: [ChallengeKind.sms] }),
        onBack: () => undefined,
      });

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to your phone.')).toBeInTheDocument();
      });
      await fillChallengePin();
      await waitFor(() => {
        expect(screen.getByText('Enter your email to continue.')).toBeInTheDocument();
      });
      expect(screen.getByTestId('navigation-close-button')).toBeInTheDocument();

      await fillIdentifyEmail();
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });

  describe('when only email challenge is available', () => {
    beforeEach(() => {
      withLoginChallenge(ChallengeKind.email);
    });

    it('shows email challenge page', async () => {
      withIdentifyVerify();
      const onDone = jest.fn();
      renderIdentify({
        config: noPhoneOnboardingConfigFixture,
        onDone,
        user: user({ challengeKinds: [ChallengeKind.email] }),
      });

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to your email.')).toBeInTheDocument();
      });
      await fillChallengePin();

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });

    it('can resend email challenge', async () => {
      const onDone = jest.fn();
      renderIdentify({
        config: noPhoneOnboardingConfigFixture,
        onDone,
        user: user({ challengeKinds: [ChallengeKind.email] }),
      });

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to your email.')).toBeInTheDocument();
      });

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

  describe('when only sms challenge is available', () => {
    beforeEach(() => {
      withLoginChallenge(ChallengeKind.sms);
    });

    it('shows sms challenge page', async () => {
      withIdentifyVerify();
      const onDone = jest.fn();
      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
        user: user({ challengeKinds: [ChallengeKind.sms] }),
      });

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to your phone.')).toBeInTheDocument();
      });
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
        user: user({ challengeKinds: [ChallengeKind.sms] }),
      });

      await waitFor(() => {
        expect(screen.getByText('Enter the 6-digit code sent to your phone.')).toBeInTheDocument();
      });
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

  describe('when has multiple challenge options', () => {
    beforeEach(() => {
      withIdentifyVerify();
    });

    it('can perform sms challenge', async () => {
      withLoginChallenge(ChallengeKind.sms);
      const onDone = jest.fn();
      renderIdentify({
        config: liveOnboardingConfigFixture,
        onDone,
        user: user({
          challengeKinds: [ChallengeKind.email, ChallengeKind.sms, ChallengeKind.biometric],
          matchingFps: [IdDI.email],
        }),
      });

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
        bootstrapEmail: 'piip@onefootprint.com',
        user: user({
          challengeKinds: [ChallengeKind.email, ChallengeKind.sms, ChallengeKind.biometric],
          matchingFps: [IdDI.email],
        }),
      });

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
        user: user({
          challengeKinds: [ChallengeKind.email, ChallengeKind.sms, ChallengeKind.biometric],
          matchingFps: [IdDI.email],
        }),
      });

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
            browser: 'Internet Explorer',
          },
          onDone,
          user: user({
            challengeKinds: [ChallengeKind.email, ChallengeKind.sms, ChallengeKind.biometric],
            matchingFps: [IdDI.email],
          }),
        });

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
        withLoginChallenge(ChallengeKind.sms);
        const onDone = jest.fn();
        renderIdentify({
          config: liveOnboardingConfigFixture,
          device: {
            type: 'desktop',
            hasSupportForWebauthn: false,
            osName: 'windows vista',
            browser: 'Internet Explorer',
          },
          onDone,
          user: user({
            challengeKinds: [ChallengeKind.sms, ChallengeKind.biometric],
          }),
        });

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
    it('bootstrap phone and email returned', async () => {
      withLoginChallenge(ChallengeKind.sms);
      withIdentifyVerify();
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'piip@onefootprint.com',
        bootstrapPhone: '+16504600799',
        config: liveOnboardingConfigFixture,
        onDone,
        user: user({ challengeKinds: ['sms'] }),
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
          availableChallengeKinds: ['sms'],
        });
      });
    });
  });

  describe('when user has unverified email', () => {
    beforeEach(() => {
      withLoginChallenge(ChallengeKind.sms);
      withIdentifyVerify();
      withKba();
    });

    const unverifiedEmailUser = {
      token: 'utok_xxx',
      isUnverified: false,
      availableChallengeKinds: [ChallengeKind.sms],
      authMethods: [
        {
          kind: AuthMethodKind.phone,
          isVerified: true,
        },
        {
          kind: AuthMethodKind.email,
          isVerified: false,
        },
      ],
      scrubbedPhone: '+1 (***) ***-**00',
      tokenScopes: [],
      matchingFps: [IdDI.email],
      hasSyncablePasskey: false,
    };

    it('can log in with unverified email after kba', async () => {
      const onDone = jest.fn();
      renderIdentify({
        bootstrapEmail: 'sandbox@onefootprint.com',
        config: liveOnboardingConfigFixture,
        onDone,
        user: unverifiedEmailUser,
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
});
