import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import React from 'react';

import { Layout } from '../../components/layout';
import Identify from './identify';
import { withOnboardingConfig } from './identify.test.config';

const useRouterSpy = createUseRouterSpy();

describe('<SandboxOutcome />', () => {
  beforeEach(() => {
    useRouterSpy({
      pathname: '/',
      query: {},
    });
  });

  const renderIdentify = () => {
    const obConfigAuth = { [CLIENT_PUBLIC_KEY_HEADER]: 'pk' };
    customRender(
      <ObserveCollectorProvider appName="bifrost">
        <Layout>
          <Identify
            obConfigAuth={obConfigAuth}
            bootstrapData={{}}
            onDone={() => {}}
          />
        </Layout>
      </ObserveCollectorProvider>,
    );
  };

  describe('when running a sandbox onboarding config', () => {
    beforeEach(() => {
      withOnboardingConfig();
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
  });
});
