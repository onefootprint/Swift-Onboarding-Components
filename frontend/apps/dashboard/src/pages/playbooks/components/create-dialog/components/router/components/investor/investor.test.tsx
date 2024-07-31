import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { InvestorProfileWithContextProps } from './investor.test.config';
import InvestorProfileWithContext from './investor.test.config';

const renderInvestorProfile = ({ investorProfileAdded }: InvestorProfileWithContextProps) => {
  customRender(<InvestorProfileWithContext investorProfileAdded={investorProfileAdded} />);
};

describe('<InvestorProfile />', () => {
  it('should show default text when not yet added', () => {
    renderInvestorProfile({ investorProfileAdded: false });
    expect(
      screen.getByText(
        "If you're a brokerage company, for instance, you're required to ask investor profile questions.",
      ),
    ).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add' });
    expect(add).toBeInTheDocument();
  });

  it('should change to questions when toggled', async () => {
    renderInvestorProfile({ investorProfileAdded: false });
    const add = screen.getByRole('button', { name: 'Add' });
    await userEvent.click(add);
    await waitFor(() => {
      const remove = screen.getByRole('button', { name: 'Remove' });
      expect(remove).toBeInTheDocument();
    });

    expect(screen.getByText("What's your employment status and occupation?")).toBeInTheDocument();
    expect(screen.getByText("What's your annual income?")).toBeInTheDocument();
    expect(screen.getByText("What's your net worth?")).toBeInTheDocument();
    expect(screen.getByText('What are your investment goals?')).toBeInTheDocument();
    expect(screen.getByText('How would you describe your risk tolerance?')).toBeInTheDocument();
    expect(screen.getByText('Do any of the following apply to you or your immediate family?')).toBeInTheDocument();
  });

  it('should show questions when default enabled', async () => {
    renderInvestorProfile({ investorProfileAdded: true });
    await waitFor(() => {
      const remove = screen.getByRole('button', { name: 'Remove' });
      expect(remove).toBeInTheDocument();
    });

    expect(screen.getByText("What's your employment status and occupation?")).toBeInTheDocument();
    expect(screen.getByText("What's your annual income?")).toBeInTheDocument();
    expect(screen.getByText("What's your net worth?")).toBeInTheDocument();
    expect(screen.getByText('What are your investment goals?')).toBeInTheDocument();
    expect(screen.getByText('How would you describe your risk tolerance?')).toBeInTheDocument();
    expect(screen.getByText('Do any of the following apply to you or your immediate family?')).toBeInTheDocument();
  });

  it('should show "add" after remove is clicked', async () => {
    renderInvestorProfile({ investorProfileAdded: true });
    const remove = screen.getByRole('button', { name: 'Remove' });
    await waitFor(() => {
      expect(remove).toBeInTheDocument();
    });
    await userEvent.click(remove);

    expect(
      screen.getByText(
        "If you're a brokerage company, for instance, you're required to ask investor profile questions.",
      ),
    ).toBeInTheDocument();
    const add = screen.getByRole('button', { name: 'Add' });
    expect(add).toBeInTheDocument();
  });
});
