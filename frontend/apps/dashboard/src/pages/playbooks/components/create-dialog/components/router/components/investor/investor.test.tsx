import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { InvestorProfileWithContextProps } from './investor.test.config';
import InvestorProfileWithContext from './investor.test.config';

const renderInvestorProfile = ({ investorProfileAdded }: InvestorProfileWithContextProps) => {
  customRender(<InvestorProfileWithContext investorProfileAdded={investorProfileAdded} />);
};

describe('<InvestorProfile />', () => {
  describe('when is not added', () => {
    it('should show the empty text', () => {
      renderInvestorProfile({ investorProfileAdded: false });

      const emptyText = screen.getByText(
        "If you're a brokerage company, for instance, you're required to ask investor profile questions.",
      );
      expect(emptyText).toBeInTheDocument();

      const add = screen.getByRole('button', { name: 'Add' });
      expect(add).toBeInTheDocument();
    });
  });

  describe('when is added', () => {
    it('should show questions when default enabled', async () => {
      renderInvestorProfile({ investorProfileAdded: true });

      const remove = screen.getByRole('button', { name: 'Remove' });
      expect(remove).toBeInTheDocument();

      const occupation = screen.getByText("What's your employment status and occupation?");
      expect(occupation).toBeInTheDocument();

      const annualIncome = screen.getByText("What's your annual income?");
      expect(annualIncome).toBeInTheDocument();

      const source = screen.getByText('What’s the source of your account funding?');
      expect(source).toBeInTheDocument();

      const netWorth = screen.getByText("What's your net worth?");
      expect(netWorth).toBeInTheDocument();

      const investmentGoals = screen.getByText('What are your investment goals?');
      expect(investmentGoals).toBeInTheDocument();

      const riskTolerance = screen.getByText('How would you describe your risk tolerance?');
      expect(riskTolerance).toBeInTheDocument();

      const family = screen.getByText('Do any of the following apply to you or your immediate family?');
      expect(family).toBeInTheDocument();
    });
  });

  describe('when toggling', () => {
    it('should change to questions when toggled', async () => {
      renderInvestorProfile({ investorProfileAdded: false });
      const add = screen.getByRole('button', { name: 'Add' });
      await userEvent.click(add);
      await waitFor(() => {
        const remove = screen.getByRole('button', { name: 'Remove' });
        expect(remove).toBeInTheDocument();
      });
    });

    it('should change to empty text when toggled', async () => {
      renderInvestorProfile({ investorProfileAdded: true });
      const remove = screen.getByRole('button', { name: 'Remove' });
      await userEvent.click(remove);
      await waitFor(() => {
        const add = screen.getByRole('button', { name: 'Add' });
        expect(add).toBeInTheDocument();
      });
    });
  });
});
