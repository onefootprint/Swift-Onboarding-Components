import {
  InvestorProfileAnnualIncome,
  InvestorProfileDI,
} from '@onefootprint/types';
import React from 'react';

import {
  renderComponent,
  screen,
  userEvent,
  waitFor,
} from '../../../../../../config/tests/render';
import type { IncomeFormProps } from './income-form';
import IncomeForm from './income-form';

describe('<IncomeForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<IncomeFormProps>) => {
    renderComponent(
      <IncomeForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('onSubmit is called when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const gt1200k = screen.getByRole('radio', {
      name: '$1,200,001+',
    }) as HTMLInputElement;
    await userEvent.click(gt1200k);
    await waitFor(() => {
      expect(gt1200k.checked).toBe(true);
    });

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.annualIncome]: InvestorProfileAnnualIncome.gt1200k,
    });
  });

  describe('renders default values correctly', () => {
    it('when there are no defaults', async () => {
      renderForm({});
      const le25k = screen.getByRole('radio', {
        name: 'Under $25,000',
      }) as HTMLInputElement;
      expect(le25k.checked).toBe(true);
    });

    it('when there is a default value prop', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.annualIncome]: InvestorProfileAnnualIncome.gt1200k,
        },
      });

      const gt1200k = screen.getByRole('radio', {
        name: '$1,200,001+',
      }) as HTMLInputElement;
      expect(gt1200k.checked).toBe(true);
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });
});
