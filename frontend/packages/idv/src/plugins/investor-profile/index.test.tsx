import themes from '@onefootprint/design-tokens';
import { ObserveCollectorProvider } from '@onefootprint/dev-tools';
import {
  createUseRouterSpy,
  render,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import React from 'react';
import { Layout } from 'src/components/layout';

import InvestorProfile from './index';
import {
  withOnboardingConfig,
  withUserVault,
  withUserVaultValidate,
} from './index.test.config';
import type { InvestorProfileProps } from './investor-profile.types';

describe('<InvestorProfile />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryCache.clear();
    useRouterSpy({
      pathname: '/',
      query: {
        public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY',
      },
    });
    withOnboardingConfig();
    withUserVaultValidate();
    withUserVault();
  });

  const getContext = () => ({
    authToken: 'token',
    customData: {},
    device: {
      type: 'mobile',
      hasSupportForWebauthn: true,
    },
  });

  const renderPlugin = ({ onDone }: Pick<InvestorProfileProps, 'onDone'>) =>
    render(
      <React.StrictMode>
        <ObserveCollectorProvider appName="test">
          <QueryClientProvider client={queryClient}>
            <DesignSystemProvider theme={themes.light}>
              <ToastProvider>
                <Layout>
                  <InvestorProfile context={getContext()} onDone={onDone} />
                </Layout>
              </ToastProvider>
            </DesignSystemProvider>
          </QueryClientProvider>
        </ObserveCollectorProvider>
      </React.StrictMode>,
    );

  it('takes user through all of the pages', async () => {
    const onDone = jest.fn();

    renderPlugin({
      onDone,
    });

    await waitFor(() => {
      expect(
        screen.getByText("What's your employment status and occupation?"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Employed')).toBeInTheDocument();

    const occupation = screen.getByLabelText('Occupation');
    await userEvent.type(occupation, 'Doctor');

    const employer = screen.getByLabelText('Employer');
    await userEvent.type(employer, 'Hospital');

    let submitButton = screen.getByText('Continue');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("What's your annual income?"),
      ).toBeInTheDocument();
    });

    submitButton = screen.getByText('Continue');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("What's your net worth?")).toBeInTheDocument();
    });

    submitButton = screen.getByText('Continue');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('What are your investment goals?'),
      ).toBeInTheDocument();
    });

    const longTerm = screen.getByLabelText(
      'Preserve capital',
    ) as HTMLInputElement;
    expect(longTerm.checked).toBe(false);
    await userEvent.click(longTerm);
    expect(longTerm.checked).toBe(true);

    submitButton = screen.getByText('Continue');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('How would you describe your risk tolerance?'),
      ).toBeInTheDocument();
    });

    submitButton = screen.getByText('Continue');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Do any of the following apply to you or a member of your immediate family?',
        ),
      ).toBeInTheDocument();
    });

    submitButton = screen.getByText('None of these apply to me');
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onDone).toHaveBeenCalled();
    });
  });
});
