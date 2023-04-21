import { InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests';

import EmploymentForm, { EmploymentFormProps } from './employment-form';

describe('<EmploymentForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<EmploymentFormProps>) => {
    renderInvestorProfile(
      <EmploymentForm
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
      [InvestorProfileDI.occupation]: '',
    });

    const trigger = screen.getByRole('button', { name: 'Unemployed' });
    await selectEvents.select(trigger, 'Employed');
    expect(screen.getByText('Employed')).toBeInTheDocument();

    const occupation = screen.getByLabelText('Occupation');
    await userEvent.type(occupation, 'Doctor');

    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.occupation]: 'Doctor',
    });
  });

  describe('renders default values correctly', () => {
    it('when there is an occupation', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.occupation]: 'Doctor',
        },
      });

      const occupation = screen.getByLabelText('Occupation');
      expect(occupation).toHaveValue('Doctor');
      expect(screen.getByText('Employed')).toBeInTheDocument();
    });

    it('when there are no default values', async () => {
      renderForm({
        defaultValues: {},
      });

      const occupation = screen.queryByLabelText('Occupation');
      expect(occupation).not.toBeInTheDocument();
      expect(screen.getByText('Unemployed')).toBeInTheDocument();
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
        [InvestorProfileDI.occupation]: 'test',
      },
    });

    const occupation = screen.getByLabelText('Occupation');
    await userEvent.clear(occupation);

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Occupation is required')).toBeInTheDocument();
    });
  });
});
