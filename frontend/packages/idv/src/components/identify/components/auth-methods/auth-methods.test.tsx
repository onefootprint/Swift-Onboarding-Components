import '../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import type * as React from 'react';

import { Layout } from '../../../layout';
import AuthMethods from './auth-methods';
import {
  fillChallengePin,
  withIdentify,
  withUserAuthMethods,
  withUserChallenge,
  withUserChallengeVerify,
  withUserVaultDecrypt,
} from './auth-methods.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

jest.mock('../../../../hooks', () => {
  const originalModule = jest.requireActual('../../../../hooks');
  return {
    ...originalModule,
    useDeviceInfo: () => undefined,
  };
});

type AuthMethodsProps = React.ComponentProps<typeof AuthMethods>;
type LayoutProps = React.ComponentProps<typeof Layout>;

const emailRegEx = /sandbox@onefootprint.com/i;
const phoneRegEx = /15555550100/i;
const renderAuthMethods = ({
  authToken,
  initialMachineState,
  onClose,
  onDone,
}: Omit<AuthMethodsProps, 'Loading'> & { onClose: LayoutProps['onClose'] }) =>
  customRender(
    <Layout onClose={onClose}>
      <AuthMethods
        authToken={authToken}
        initialMachineState={initialMachineState}
        onDone={onDone ?? (() => undefined)}
      />
    </Layout>,
  );

describe('<AuthMethods />', () => {
  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
  });

  describe('for dashboard machine state', () => {
    beforeEach(() => {
      withIdentify(true);
      withUserAuthMethods();
      withUserChallenge();
      withUserChallengeVerify();
      withUserVaultDecrypt();
    });

    it('should render all the necessary wording', () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      expect(screen.getByText(/Review your authentication details/i)).toBeInTheDocument();
      expect(screen.getByText(/You can edit the details in your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Loading/i)).toBeInTheDocument();
      expect(screen.getByText(/Finish/i)).toBeInTheDocument();
    });

    it('should show decrypted email and phone, and passkey', async () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      expect(await screen.findByText(emailRegEx)).toBeInTheDocument();
      expect(await screen.findByText(phoneRegEx)).toBeInTheDocument();
      expect(await screen.findByText('Passkey')).toBeInTheDocument();
      expect(await screen.findAllByText(/Verified/i)).toHaveLength(2);
    });

    it('should be possible to edit email', async () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      expect(await screen.findByText(emailRegEx)).toBeInTheDocument();
      await userEvent.click(screen.getByText(emailRegEx));

      expect(await screen.findByText(/Update your email/i)).toBeInTheDocument();
      const emailField = screen.getByLabelText('Email');
      await userEvent.type(emailField, 'piip@onefootprint.com');
      await userEvent.click(screen.getByText('Continue'));

      expect(await screen.findByText(/Verify your email address/i)).toBeInTheDocument();
      expect(await screen.findByText(/piip@onefootprint.com/i)).toBeInTheDocument();
      await fillChallengePin();

      expect(await screen.findByText(/Finish/i)).toBeInTheDocument();
    });

    it('should be possible to edit phone', async () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      expect(await screen.findByText(phoneRegEx)).toBeInTheDocument();
      await userEvent.click(screen.getByText(phoneRegEx));

      expect(await screen.findByText(/Update your phone number/i)).toBeInTheDocument();
      const emailField = screen.getByLabelText('Phone number');
      await userEvent.type(emailField, '5555550100');
      await userEvent.click(screen.getByText('Verify with SMS'));

      expect(await screen.findByText(/Verify your phone number/i)).toBeInTheDocument();
      await fillChallengePin();

      expect(await screen.findByText(/Finish/i)).toBeInTheDocument();
    });

    it('should be possible to start the passkey update flow', async () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      expect(await screen.findByText('Passkey')).toBeInTheDocument();
      await userEvent.click(screen.getByText('Passkey'));

      expect(await screen.findByText(/Replace your passkey/i)).toBeInTheDocument();

      expect(await screen.findByText('Launch registration')).toBeInTheDocument();
    });
  });
});
