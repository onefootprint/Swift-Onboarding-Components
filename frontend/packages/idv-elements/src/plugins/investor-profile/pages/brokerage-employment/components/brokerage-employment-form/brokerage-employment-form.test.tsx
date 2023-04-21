import { InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests';

import BrokerageEmploymentForm, {
  BrokerageEmploymentFormProps,
} from './brokerage-employment-form';

describe('<BrokerageEmploymentForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<BrokerageEmploymentFormProps>) => {
    renderInvestorProfile(
      <BrokerageEmploymentForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('should trigger onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const button = screen.getByRole('button', { name: 'Continue' });

    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.employedByBrokerageFirm]: '',
    });

    const option = screen.getByLabelText('Yes, I am');
    await userEvent.click(option);

    const input = screen.getByLabelText('Firm');
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });

    await userEvent.type(input, 'Test');
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.employedByBrokerageFirm]: 'Test',
    });
  });

  describe('renders default values correctly', () => {
    it('when there is a firm name', () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.employedByBrokerageFirm]: 'Test',
        },
      });

      const option = screen.getByLabelText('Yes, I am');
      expect(option).toBeChecked();
      const input = screen.getByLabelText('Firm');
      expect(input).toHaveValue('Test');
    });

    it('when there are no default values', () => {
      renderForm({ defaultValues: {} });

      const option = screen.getByLabelText('No, I am not');
      expect(option).toBeChecked();
      const firm = screen.queryByLabelText('Firm');
      expect(firm).not.toBeInTheDocument();
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });

  it('renders error state correctly', async () => {
    renderForm({
      defaultValues: {
        [InvestorProfileDI.employedByBrokerageFirm]: 'test',
      },
    });

    const firm = screen.getByLabelText('Firm');
    await userEvent.clear(firm);

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Firm is required')).toBeInTheDocument();
    });
  });
});
