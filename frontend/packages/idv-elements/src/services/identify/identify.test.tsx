import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import {
  ChallengeKind,
  CLIENT_PUBLIC_KEY_HEADER,
  IdentifyBootstrapData,
} from '@onefootprint/types';
import React from 'react';

import { Layout } from '../../components/layout';
import Identify from './identify';
import {
  liveOnboardingConfigFixture,
  sandboxOnboardingConfigFixture,
  withIdentify,
  withLoginChallenge,
  withOnboardingConfig,
} from './identify.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<Identify />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/',
      query: {},
    });
  });

  const renderIdentify = (bootstrapData?: IdentifyBootstrapData) => {
    const obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' };
    customRender(
      <ObserveCollectorProvider appName="bifrost">
        <Layout>
          <Identify
            obConfigAuth={obConfigAuth}
            bootstrapData={bootstrapData ?? {}}
            onDone={() => {}}
          />
        </Layout>
      </ObserveCollectorProvider>,
    );
  };

  describe('when running a sandbox onboarding config', () => {
    beforeEach(() => {
      withOnboardingConfig(sandboxOnboardingConfigFixture);
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

      await waitFor(() => {
        expect(screen.getByText('Select test outcome')).toBeInTheDocument();
      });

      const testIDField = screen.getByLabelText('Test ID');
      await userEvent.type(testIDField, 'validtestid1234');
      await userEvent.click(screen.getByText('Continue'));

      await waitFor(() => {
        expect(
          screen.getByText('Enter your email to get started.'),
        ).toBeInTheDocument();
      });
    });

    describe('When there is bootstrap data', () => {
      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false);
        });

        it('takes new user to sandbox page', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';

          renderIdentify({
            email,
            phoneNumber,
          });

          await waitFor(() => {
            expect(screen.getByText('Select test outcome')).toBeInTheDocument();
          });
          const testIDField = screen.getByLabelText('Test ID');
          await userEvent.type(testIDField, 'testId');
          await userEvent.click(screen.getByText('Continue'));

          await waitFor(() => {
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
          });
          const emailField = screen.getByLabelText('Email');
          expect(emailField).toHaveValue(email);
        });
      });

      describe('When user found', () => {
        beforeEach(() => {
          withIdentify(true);
          withLoginChallenge(ChallengeKind.sms);
        });

        it('takes user to sandbox then challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';

          renderIdentify({
            email,
            phoneNumber,
          });

          await waitFor(() => {
            expect(screen.getByText('Select test outcome')).toBeInTheDocument();
          });
          const testIDField = screen.getByLabelText('Test ID');
          await userEvent.type(testIDField, 'testId');
          await userEvent.click(screen.getByText('Continue'));

          await waitFor(() => {
            expect(
              screen.getByText(
                'We found a Footprint account with the information you provided to Acme Bank.',
              ),
            ).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'Enter the 6-digit code sent to +1 ••• ••• ••99.',
              ),
            ).toBeInTheDocument();
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
          withIdentify(true);
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';

          renderIdentify({
            email,
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'We found a Footprint account with the information you provided to Acme Bank.',
              ),
            ).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'Enter the 6-digit code sent to +1 (•••) •••-••99.',
              ),
            ).toBeInTheDocument();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false);
        });

        it('prefills email', async () => {
          const email = 'piip@onefootprint.com';

          renderIdentify({
            email,
          });

          await waitFor(() => {
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
          });
          const emailField = screen.getByLabelText('Email');
          expect(emailField).toHaveValue(email);
        });
      });
    });

    describe('When there is bootstrap phone', () => {
      describe('When user found', () => {
        beforeEach(() => {
          withIdentify(true);
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const phoneNumber = '+1 234 567 8999';

          renderIdentify({
            phoneNumber,
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'We found a Footprint account with the information you provided to Acme Bank.',
              ),
            ).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'Enter the 6-digit code sent to +1 ••• ••• ••99.',
              ),
            ).toBeInTheDocument();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false);
        });

        // TODO: Phone default value prefill is broken
        it('prefills the phone', async () => {
          const phoneNumber = '+1 (234) 567-8999';

          renderIdentify({
            phoneNumber,
          });

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
        });
      });
    });

    describe('When there is bootstrap email and phone', () => {
      describe('When user found', () => {
        beforeEach(() => {
          withIdentify(true);
          withLoginChallenge(ChallengeKind.sms);
        });

        it('skips to challenge', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';

          renderIdentify({
            email,
            phoneNumber,
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'We found a Footprint account with the information you provided to Acme Bank.',
              ),
            ).toBeInTheDocument();
          });

          await waitFor(() => {
            expect(
              screen.getByText(
                'Enter the 6-digit code sent to +1 ••• ••• ••99.',
              ),
            ).toBeInTheDocument();
          });
        });
      });

      describe('When user not found', () => {
        beforeEach(() => {
          withIdentify(false);
        });

        it('prefills email and phone', async () => {
          const email = 'piip@onefootprint.com';
          const phoneNumber = '+1 234 567 8999';

          renderIdentify({
            email,
            phoneNumber,
          });

          await waitFor(() => {
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
          });
          const emailField = screen.getByLabelText('Email');
          expect(emailField).toHaveValue(email);
          await userEvent.click(screen.getByText('Continue'));

          await waitFor(() => {
            expect(screen.getByText('Phone number')).toBeInTheDocument();
          });
          expect(
            screen.getByDisplayValue('(234) 567-8999'),
          ).toBeInTheDocument();
        });
      });
    });
  });
});
