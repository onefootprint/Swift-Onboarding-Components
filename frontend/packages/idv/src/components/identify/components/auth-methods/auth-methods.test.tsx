import '../../../../config/initializers/i18next-test';

import { customRender, mockRouter, screen, userEvent, waitFor } from '@onefootprint/test-utils';
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
        Loading={<span />}
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

      expect(screen.getByText(/Revise your authentication details/i)).toBeInTheDocument();
      expect(screen.getByText(/You can edit the details in your account/i)).toBeInTheDocument();
      expect(screen.getByText(/Email/i)).toBeInTheDocument();
      expect(screen.getByText(/Phone number/i)).toBeInTheDocument();
      expect(screen.getByText(/Finish/i)).toBeInTheDocument();
    });

    it('should show decrypted + verified email and phone', async () => {
      const onClose = jest.fn();
      const onDone = jest.fn();
      renderAuthMethods({
        authToken: 'authToken',
        initialMachineState: 'dashboard',
        onClose,
        onDone,
      });

      await waitFor(() => {
        expect(screen.getByText(emailRegEx)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText(phoneRegEx)).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getAllByText(/Verified/i)).toHaveLength(2);
      });
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

      await waitFor(() => {
        const btnWithEmail = screen.getByText(emailRegEx);
        expect(btnWithEmail).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText(emailRegEx));

      await waitFor(() => {
        const el = screen.getByText(/Update your email/i);
        expect(el).toBeInTheDocument();
      });

      const emailField = screen.getByLabelText('Email');
      await userEvent.type(emailField, 'piip@onefootprint.com');
      await userEvent.click(screen.getByText('Continue'));

      await waitFor(() => {
        const el = screen.getByText(/Verify your email address/i);
        expect(el).toBeInTheDocument();
      });
      await waitFor(() => {
        const el = screen.getByText(/piip@onefootprint.com/i);
        expect(el).toBeInTheDocument();
      });

      await fillChallengePin();

      await waitFor(() => {
        const el = screen.getByText(/Finish/i);
        expect(el).toBeInTheDocument();
      });
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

      await waitFor(() => {
        const btnWithPhone = screen.getByText(phoneRegEx);
        expect(btnWithPhone).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText(phoneRegEx));

      await waitFor(() => {
        const el = screen.getByText(/Update your phone number/i);
        expect(el).toBeInTheDocument();
      });

      const emailField = screen.getByLabelText('Phone number');
      await userEvent.type(emailField, '5555550100');
      await userEvent.click(screen.getByText('Verify with SMS'));

      await waitFor(() => {
        const el = screen.getByText(/Verify your phone number/i);
        expect(el).toBeInTheDocument();
      });

      await fillChallengePin();

      await waitFor(() => {
        const el = screen.getByText(/Finish/i);
        expect(el).toBeInTheDocument();
      });
    });
  });
});
