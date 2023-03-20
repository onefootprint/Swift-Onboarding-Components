import {
  InvestorProfileDataAttribute,
  InvestorProfileInvestmentGoal,
} from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests/render';

import InvestmentGoalsForm, {
  InvestmentGoalsFormProps,
} from './investment-goals-form';

describe('<InvestmentGoalsForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<InvestmentGoalsFormProps>) => {
    renderInvestorProfile(
      <InvestmentGoalsForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('should trigger onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
    });

    const longTerm = screen.getByLabelText(
      'Grow long-term wealth',
    ) as HTMLInputElement;
    expect(longTerm.checked).toBe(false);
    await userEvent.click(longTerm);
    expect(longTerm.checked).toBe(true);

    const saveForRetirement = screen.getByLabelText(
      'Save for retirement',
    ) as HTMLInputElement;
    expect(saveForRetirement.checked).toBe(false);

    const supportLovedOnes = screen.getByLabelText(
      'Support my loved ones',
    ) as HTMLInputElement;
    expect(supportLovedOnes.checked).toBe(false);
    await userEvent.click(supportLovedOnes);
    expect(supportLovedOnes.checked).toBe(true);

    const buyAHome = screen.getByLabelText('Buy a home') as HTMLInputElement;
    expect(buyAHome.checked).toBe(false);

    const payOffDebt = screen.getByLabelText(
      'Pay off debt',
    ) as HTMLInputElement;
    expect(payOffDebt.checked).toBe(false);

    const startMyOwnBusiness = screen.getByLabelText(
      'Start my own business',
    ) as HTMLInputElement;
    expect(startMyOwnBusiness.checked).toBe(false);

    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDataAttribute.investmentGoals]: [
        InvestorProfileInvestmentGoal.growLongTermWealth,
        InvestorProfileInvestmentGoal.supportLovedOnes,
      ],
    });
  });

  it('renders default values correctly', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      defaultValues: {
        [InvestorProfileDataAttribute.investmentGoals]: [
          InvestorProfileInvestmentGoal.buyAHome,
          InvestorProfileInvestmentGoal.payOffDebt,
        ],
      },
    });

    const longTerm = screen.getByLabelText(
      'Grow long-term wealth',
    ) as HTMLInputElement;
    expect(longTerm.checked).toBe(false);

    const saveForRetirement = screen.getByLabelText(
      'Save for retirement',
    ) as HTMLInputElement;
    expect(saveForRetirement.checked).toBe(false);

    const supportLovedOnes = screen.getByLabelText(
      'Support my loved ones',
    ) as HTMLInputElement;
    expect(supportLovedOnes.checked).toBe(false);

    const buyAHome = screen.getByLabelText('Buy a home') as HTMLInputElement;
    expect(buyAHome.checked).toBe(true);

    const payOffDebt = screen.getByLabelText(
      'Pay off debt',
    ) as HTMLInputElement;
    expect(payOffDebt.checked).toBe(true);

    const startMyOwnBusiness = screen.getByLabelText(
      'Start my own business',
    ) as HTMLInputElement;
    expect(startMyOwnBusiness.checked).toBe(false);

    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDataAttribute.investmentGoals]: [
        InvestorProfileInvestmentGoal.buyAHome,
        InvestorProfileInvestmentGoal.payOffDebt,
      ],
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });

  it('renders error state correctly', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(
        screen.getByText('Please select at least one goal'),
      ).toBeInTheDocument();
    });
  });
});
