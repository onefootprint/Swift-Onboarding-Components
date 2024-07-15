import themes from '@onefootprint/design-tokens';
import { createUseRouterSpy, render, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { Layout } from 'src/components/layout';

import InvestorProfile from './index';
import { withDecryptUser, withOnboardingConfig, withUserVault, withUserVaultValidate } from './index.test.config';
import type { InvestorProfileProps } from './investor-profile.types';

describe('<InvestorProfile />', () => {
  const useRouterSpy = createUseRouterSpy();
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    logger: {
      log: () => undefined,
      warn: () => undefined,
      error: () => undefined,
    },
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    queryCache.clear();
    useRouterSpy({ pathname: '/', query: { public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY' } });
    withOnboardingConfig();
    withUserVaultValidate();
    withUserVault();
    withDecryptUser();
  });

  const renderPlugin = ({ onDone }: Pick<InvestorProfileProps, 'onDone'>) => {
    const idvContext = {
      authToken: 'token',
      device: {
        type: 'mobile',
        hasSupportForWebauthn: true,
        osName: 'iOS',
        browser: 'Mobile Safari',
      },
    };
    return render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <DesignSystemProvider theme={themes.light}>
            <ToastProvider>
              <Layout>
                <InvestorProfile idvContext={idvContext} context={{}} onDone={onDone} />
              </Layout>
            </ToastProvider>
          </DesignSystemProvider>
        </QueryClientProvider>
      </React.StrictMode>,
    );
  };

  it('takes user through all of the pages', async () => {
    const onDone = jest.fn();

    renderPlugin({ onDone });

    await waitFor(() => {
      expect(screen.getByText("What's your employment status and occupation?")).toBeInTheDocument();
    });
    expect(screen.getByText('Employed')).toBeInTheDocument();

    const occupation = screen.getByLabelText('Occupation');
    await userEvent.type(occupation, 'Doctor');

    const employer = screen.getByLabelText('Employer');
    await userEvent.type(employer, 'Hospital');

    let ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.getByText("What's your annual income?")).toBeInTheDocument();
    });

    ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.getByText("What's your net worth?")).toBeInTheDocument();
    });

    ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.getByText('What are your investment goals?')).toBeInTheDocument();
    });

    const longTerm = screen.getByLabelText('Preserve capital') as HTMLInputElement;
    expect(longTerm.checked).toBe(false);
    await userEvent.click(longTerm);
    expect(longTerm.checked).toBe(true);

    ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.getByText('How would you describe your risk tolerance?')).toBeInTheDocument();
    });

    ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(
        screen.getByText('Do any of the following apply to you or a member of your immediate family?'),
      ).toBeInTheDocument();
    });

    ctaButton = screen.getByText('Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm your profile')).toBeInTheDocument();
    });

    ctaButton = screen.getByText('Confirm & Continue');
    await userEvent.click(ctaButton);

    await waitFor(() => {
      expect(onDone).toHaveBeenCalled();
    });
  });
});
