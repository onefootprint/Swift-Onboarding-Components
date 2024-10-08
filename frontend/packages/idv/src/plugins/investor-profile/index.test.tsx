import themes from '@onefootprint/design-tokens';
import { render, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { DesignSystemProvider, ToastProvider } from '@onefootprint/ui';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import mockRouter from 'next-router-mock';
import React from 'react';
import { Layout } from 'src/components/layout';

import InvestorProfile from './index';
import { withDecryptUser, withOnboardingConfig, withUserVault, withUserVaultValidate } from './index.test.config';
import type { InvestorProfileProps } from './investor-profile.types';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<InvestorProfile />', () => {
  const queryCache = new QueryCache();
  const queryClient = new QueryClient({
    queryCache,
    defaultOptions: { queries: { retry: false } },
  });

  beforeEach(() => {
    mockRouter.setCurrentUrl('/');
    mockRouter.query = { public_key: 'ob_test_yK7Wn5qL7xUSlvhG6AZQuY' };
  });

  beforeEach(() => {
    withOnboardingConfig();
    withUserVaultValidate();
    withUserVault();
    withDecryptUser();
  });

  afterEach(() => {
    queryCache.clear();
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

    // Occupation
    await waitFor(() => {
      const occupation = screen.getByText("What's your employment status and occupation?");
      expect(occupation).toBeInTheDocument;
    });

    const occupationField = screen.getByLabelText('Occupation');
    await userEvent.type(occupationField, 'Doctor');

    const employerField = screen.getByLabelText('Employer');
    await userEvent.type(employerField, 'Hospital');

    await userEvent.click(screen.getByText('Continue'));

    // Annual income
    await waitFor(() => {
      const annualIncome = screen.getByText("What's your annual income?");
      expect(annualIncome).toBeInTheDocument();
    });

    const option100to200 = screen.getByRole('radio', {
      name: '$100,001 - $200,000',
    });
    await userEvent.click(option100to200);

    await userEvent.click(screen.getByText('Continue'));

    // Net worth
    await waitFor(() => {
      const netWorth = screen.getByText("What's your net worth?");
      expect(netWorth).toBeInTheDocument();
    });

    const option500to1kk = screen.getByRole('radio', {
      name: '$500,000 - $1,000,000',
    });
    await userEvent.click(option500to1kk);

    await userEvent.click(screen.getByText('Continue'));

    // Funding sources
    await waitFor(() => {
      const fundingSources = screen.getByText('What’s the source of your account funding?');
      expect(fundingSources).toBeInTheDocument();
    });

    const familyOption = screen.getByLabelText('Family') as HTMLInputElement;
    await userEvent.click(familyOption);

    await userEvent.click(screen.getByText('Continue'));

    // Investment goals
    await waitFor(() => {
      const goals = screen.getByText('What are your investment goals?');
      expect(goals).toBeInTheDocument();
    });

    const preserveOption = screen.getByLabelText('Preserve capital') as HTMLInputElement;
    await userEvent.click(preserveOption);

    await userEvent.click(screen.getByText('Continue'));

    // Risk tolerance
    await waitFor(() => {
      const riskTolerance = screen.getByText('How would you describe your risk tolerance?');
      expect(riskTolerance).toBeInTheDocument();
    });

    const moderateOption = screen.getByRole('radio', { name: 'Moderate' });
    await userEvent.click(moderateOption);

    await userEvent.click(screen.getByText('Continue'));

    // Declarations
    await waitFor(() => {
      const declarations = screen.getByText(
        'Do any of the following apply to you or a member of your immediate family?',
      );
      expect(declarations).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Continue'));

    // Confirm
    await waitFor(() => {
      const confirm = screen.getByText('Confirm your profile');
      expect(confirm).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Confirm & Continue'));

    await waitFor(() => {
      expect(onDone).toHaveBeenCalled();
    });
  });
});
