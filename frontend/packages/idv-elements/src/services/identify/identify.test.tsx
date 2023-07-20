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
  fillIdentifyEmail,
  fillIdentifyPhone,
  fillSandboxOutcome,
  fillSmsPin,
  liveOnboardingConfigFixture,
  mockGetBiometricChallengeResponse,
  mockUseDeviceInfo,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withIdentifyVerify,
  withLoginChallenge,
  withOnboardingConfig,
  withSignupChallenge,
  withUserVault,
} from './identify.test.config';

jest.mock('../../hooks/ui/use-device-info', () => ({
  __esModule: true,
  ...jest.requireActual('../../hooks/ui/use-device-info'),
}));

jest.mock('./utils/biometrics/get-biometric-challenge-response', () => ({
  __esModule: true,
  ...jest.requireActual('./utils/biometrics/get-biometric-challenge-response'),
}));

const useRouterSpy = createUseRouterSpy();

describe.skip('<Identify />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/',
      query: {},
    });
  });

  const renderIdentify = (bootstrapData?: any, onDone?: () => {}) => {
    const obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' };
    customRender(
      <ObserveCollectorProvider appName="bifrost">
        <Layout onClose={() => {}}>
          <Identify
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData ?? {}}
            onDone={onDone ?? (() => {})}
          />
        </Layout>
      </ObserveCollectorProvider>,
    );
  };

  describe('when running a sandbox onboarding config', () => {
    beforeEach(() => {
      withOnboardingConfig(sandboxOnboardingConfigFixture);
      withIdentify(false);
    });

    it('shows sandbox outcome selection page', async () => {
      renderIdentify();

      await waitFor(() => {
        expect(screen.getByText('Select test outcome')).toBeInTheDocument();
      });

      const testIDField = screen.getByLabelText('Test ID');
      await userEvent.type(testIDField, '$wag');
      await userEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Test ID is invalid. Please remove spaces and special characters.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('will flag backslash as invalid test ID config number', async () => {
      renderIdentify();

      await waitFor(() => {
        expect(screen.getByText('Select test outcome')).toBeInTheDocument();
      });

      const testIDField = screen.getByLabelText('Test ID');
      await userEvent.type(testIDField, 'm\\');
      await userEvent.click(screen.getByText('Continue'));
      await waitFor(() => {
        expect(
          screen.getByText(
            'Test ID is invalid. Please remove spaces and special characters.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('shows errors if sandbox test id is empty or invalid', async () => {
      renderIdentify();

      await waitFor(() => {
        expect(screen.getByText('Select test outcome')).toBeInTheDocument();
      });

      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.getByText('Test ID is required')).toBeInTheDocument();
      });

      const testIDField = screen.getByLabelText('Test ID');
      await userEvent.type(testIDField, '$wag');
      await userEvent.click(continueButton);
      await waitFor(() => {
        expect(
          screen.getByText(
            'Test ID is invalid. Please remove spaces and special characters.',
          ),
        ).toBeInTheDocument();
      });

      await userEvent.type(testIDField, '$wag');
      await userEvent.click(continueButton);
      await waitFor(() => {
        expect(
          screen.getByText(
            'Test ID is invalid. Please remove spaces and special characters.',
          ),
        ).toBeInTheDocument();
      });
    });

    it('proceeds to email identification when sandbox outcome was successful', async () => {
      renderIdentify();

      await fillSandboxOutcome();

      await waitFor(() => {
        expect(
          screen.getByText('Enter your email to get started.'),
        ).toBeInTheDocument();
      });

      await fillIdentifyEmail();
    });

    describe('When there is bootstrap email + phone data', () => {
      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false, []);
          withIdentifyVerify();
          withSignupChallenge();
          withUserVault();
        });

        it('takes new user to sandbox page', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify(
            {
              email,
              phoneNumber,
            },
            onDone,
          );

          await fillSandboxOutcome();
          await bootstrapNewUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('When user found', () => {
        beforeEach(() => {
          mockUseDeviceInfo();
          mockGetBiometricChallengeResponse();
          withIdentify(true);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.biometric);
        });

        it('takes user to sandbox then challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify(
            {
              email,
              phoneNumber,
            },
            onDone,
          );

          await fillSandboxOutcome();
          await bootstrapExistingUserWithPasskey();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('When running a live onboarding config', () => {
    beforeEach(() => {
      withOnboardingConfig(liveOnboardingConfigFixture);
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

          renderIdentify(
            {
              email,
            },
            onDone,
          );

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

          renderIdentify(
            {
              email,
            },
            onDone,
          );

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
          await fillSmsPin();

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

          renderIdentify(
            {
              phoneNumber,
            },
            onDone,
          );

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

          renderIdentify(
            {
              phoneNumber,
            },
            onDone,
          );

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
          await userEvent.click(screen.getByText('Continue'));

          await fillSmsPin();

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });

    describe('When there is bootstrap email and phone', () => {
      describe('When user found', () => {
        beforeEach(() => {
          mockUseDeviceInfo();
          mockGetBiometricChallengeResponse();
          withIdentify(true);
          withIdentifyVerify();
          withLoginChallenge(ChallengeKind.biometric);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';
          const onDone = jest.fn();

          renderIdentify(
            {
              email,
              phoneNumber,
            },
            onDone,
          );

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

          renderIdentify(
            {
              email,
              phoneNumber,
            },
            onDone,
          );

          await bootstrapNewUser();
          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
