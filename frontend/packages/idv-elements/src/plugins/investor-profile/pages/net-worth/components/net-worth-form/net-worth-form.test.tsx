import {
  InvestorProfileDI,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import React from 'react';

import {
  renderComponent,
  screen,
  userEvent,
  waitFor,
} from '../../../../../../config/tests/render';
import type { NetWorthFormProps } from './net-worth-form';
import NetWorthForm from './net-worth-form';

describe('<NetWorthForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<NetWorthFormProps>) => {
    renderComponent(
      <NetWorthForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('onSubmit is called when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const gt50kLe100k = screen.getByRole('radio', {
      name: '$50,001 - $100,000',
    }) as HTMLInputElement;
    await userEvent.click(gt50kLe100k);
    await waitFor(() => {
      expect(gt50kLe100k.checked).toBe(true);
    });

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.netWorth]: InvestorProfileNetWorth.gt50kLe100k,
    });
  });

  describe('renders default values correctly', () => {
    it('when there are no defaults', async () => {
      renderForm({});

      const le50k = screen.getByRole('radio', {
        name: 'Under $50,000',
      }) as HTMLInputElement;
      expect(le50k.checked).toBe(true);
    });

    it('when there is a default value prop', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.netWorth]: InvestorProfileNetWorth.gt5m,
        },
      });

      const gt5m = screen.getByRole('radio', {
        name: '$5,000,000+',
      }) as HTMLInputElement;
      expect(gt5m.checked).toBe(true);
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });
});
